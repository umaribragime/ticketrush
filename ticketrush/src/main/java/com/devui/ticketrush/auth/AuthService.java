package com.devui.ticketrush.auth;

import com.devui.ticketrush.auth.dto.LoginRequest;
import com.devui.ticketrush.auth.dto.SignupRequest;
import com.devui.ticketrush.auth.dto.TokenResponse;
import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.user.Role;
import com.devui.ticketrush.user.User;
import com.devui.ticketrush.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional
    public User signup(SignupRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_USED);
        }
        Set<Role> roles = EnumSet.of(Role.ATTENDEE);
        if (request.accountType() == SignupRequest.AccountType.ORGANIZER) {
            roles.add(Role.ORGANIZER);
        }
        User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()), roles);
        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // Two signups with the same email at the same moment: the UNIQUE constraint saves us.
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_USED);
        }
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                // Same error for "no such email" and "wrong password", so attackers learn nothing.
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        return tokenService.issue(user);
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
