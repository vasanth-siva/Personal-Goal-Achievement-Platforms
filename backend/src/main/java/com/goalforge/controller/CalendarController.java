package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.CalendarEventDto;
import com.goalforge.service.CalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getCalendarEvents(Authentication authentication) {
        String email = authentication.getName();
        List<CalendarEventDto> events = calendarService.getCalendarEvents(email);
        return ResponseEntity.ok(ApiResponse.ok("Calendar events retrieved successfully", events));
    }
}
