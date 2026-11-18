package com.devui.ticketrush.user;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.event.EventRepository;
import com.devui.ticketrush.order.OrderRepository;
import com.devui.ticketrush.ticket.TicketRepository;
import com.devui.ticketrush.ticket.TicketStatus;
import com.devui.ticketrush.user.dto.UserResponse;
import com.devui.ticketrush.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/** "My account": read and change your own profile. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public UserResponse me(UUID userId) {
        return UserResponse.from(get(userId));
    }

    @Transactional
    public UserResponse rename(UUID userId, String name) {
        User user = get(userId);
        user.rename(name.trim());
        return UserResponse.from(user);
    }

    /** Needs the current password, so a stolen (still logged-in) session can't lock the owner out. */
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = get(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }
        user.changePasswordHash(passwordEncoder.encode(newPassword));
    }

    public UserSummaryResponse summary(UUID userId) {
        Instant now = Instant.now(clock);
        return new UserSummaryResponse(
                ticketRepository.countByOrder_User_Id(userId),
                ticketRepository.countByOrder_User_IdAndStatusAndTicketType_Event_StartAtAfter(
                        userId, TicketStatus.ACTIVE, now),
                orderRepository.countByUserId(userId),
                eventRepository.countByOrganizerId(userId));
    }

    private User get(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
