package com.devui.ticketrush.event.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddStaffRequest(@NotBlank @Email String email) {
}
