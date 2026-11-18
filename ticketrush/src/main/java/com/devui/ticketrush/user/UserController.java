package com.devui.ticketrush.user;

import com.devui.ticketrush.auth.CurrentUser;
import com.devui.ticketrush.user.dto.ChangePasswordRequest;
import com.devui.ticketrush.user.dto.UpdateProfileRequest;
import com.devui.ticketrush.user.dto.UserResponse;
import com.devui.ticketrush.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/** "My account" endpoints. A user can only ever read or change their own data (id comes from the token). */
@Tag(name = "Users")
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return userService.me(CurrentUser.id(jwt));
    }

    @PatchMapping
    public UserResponse updateProfile(@AuthenticationPrincipal Jwt jwt,
                                      @Valid @RequestBody UpdateProfileRequest request) {
        return userService.rename(CurrentUser.id(jwt), request.name());
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal Jwt jwt,
                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(CurrentUser.id(jwt), request.currentPassword(), request.newPassword());
    }

    @GetMapping("/summary")
    public UserSummaryResponse summary(@AuthenticationPrincipal Jwt jwt) {
        return userService.summary(CurrentUser.id(jwt));
    }
}
