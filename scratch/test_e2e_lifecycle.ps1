# ==============================================================================
# GoalForge Complete End-to-End Lifecycle & Security Automated Test Suite
# ==============================================================================
# Tests the full 14-step flow:
# Register -> Login -> Dashboard -> Create Goal -> Create Phases -> Add Tasks ->
# Complete Tasks -> Phase Progress Updates -> Goal Progress Updates ->
# Achievement Unlocks -> Dashboard Stats Update -> Calendar Updates ->
# Notifications -> Multi-tenant Security Isolation -> Logout
# ==============================================================================

$baseUrl = "http://localhost:8080"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$userEmail = "e2e.tester.$timestamp@goalforge.io"
$userPassword = "Password123!"
$userName = "E2E Master Tester"

$passCount = 0
$failCount = 0

function Assert-Condition($condition, $message) {
    if ($condition) {
        Write-Host " [PASS] $message" -ForegroundColor Green
        $global:passCount++
    } else {
        Write-Host " [FAIL] $message" -ForegroundColor Red
        $global:failCount++
    }
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       GOALFORGE COMPREHENSIVE END-TO-END LIFECYCLE TEST        " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 0. Health Check
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Assert-Condition ($health.status -eq "UP" -or $health.success -eq $true) "0. Backend server is alive and healthy"
} catch {
    Write-Host " [FATAL] Backend server is not running at $baseUrl" -ForegroundColor Red
    exit 1
}

# 1. Register User
$regPayload = @{
    fullName = $userName
    email = $userEmail
    password = $userPassword
} | ConvertTo-Json

try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regPayload -ContentType "application/json"
    $userToken = $regRes.data.token
    Assert-Condition ($userToken -ne $null -and $regRes.data.user.email -eq $userEmail) "1. Register new user successfully with JWT issued"
} catch {
    Assert-Condition $false "1. Register new user ($($_.Exception.Message))"
    exit 1
}

# 2. Login User
$loginPayload = @{
    email = $userEmail
    password = $userPassword
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $authToken = $loginRes.data.token
    Assert-Condition ($authToken -ne $null -and $loginRes.data.user.email -eq $userEmail) "2. Login credentials authenticated and JWT returned"
} catch {
    Assert-Condition $false "2. Login credentials authentication ($($_.Exception.Message))"
    exit 1
}

$authHeader = @{ "Authorization" = "Bearer $authToken" }

# 3. Verify Authenticated Profile & Initial Empty Dashboard
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $authHeader
    Assert-Condition ($profile.data.email -eq $userEmail) "3. Authenticated profile retrieved via /api/auth/me"

    $initialGoals = Invoke-RestMethod -Uri "$baseUrl/api/goals" -Method Get -Headers $authHeader
    Assert-Condition ($initialGoals.data.Count -eq 0) "3b. Dashboard initial state: Clean database with 0 goals for new user"
} catch {
    Assert-Condition $false "3. Retrieve profile / initial state ($($_.Exception.Message))"
}

# 4. Create Goal
$goalPayload = @{
    title = "Master Cloud Architecture & Spring Boot 3"
    description = "End-to-end mastery of enterprise microservices and scalable web applications."
    category = "Career"
    priority = "High"
    startDate = (Get-Date).ToString("yyyy-MM-dd")
    targetDate = (Get-Date).AddMonths(3).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$createdGoalId = $null
try {
    $goalRes = Invoke-RestMethod -Uri "$baseUrl/api/goals" -Method Post -Headers $authHeader -Body $goalPayload -ContentType "application/json"
    $createdGoalId = $goalRes.data.id
    Assert-Condition ($createdGoalId -ne $null -and $goalRes.data.title -eq "Master Cloud Architecture & Spring Boot 3") "4. Create Goal created with ID $createdGoalId"
} catch {
    Assert-Condition $false "4. Create Goal ($($_.Exception.Message))"
    exit 1
}

# 5. Create Execution Phases
$phase1Payload = @{
    phaseName = "Phase 1: Foundations & Security Architecture"
    description = "Master Spring Security 6, JWT, and PostgreSQL connection pooling."
    phaseOrder = 1
} | ConvertTo-Json

$phase2Payload = @{
    phaseName = "Phase 2: Production Deployments & Microservices"
    description = "Containerization with Docker, Kubernetes, and Supabase cloud setup."
    phaseOrder = 2
} | ConvertTo-Json

$phase1Id = $null
$phase2Id = $null
try {
    $p1Res = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId/phases" -Method Post -Headers $authHeader -Body $phase1Payload -ContentType "application/json"
    $phase1Id = $p1Res.data.id

    $p2Res = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId/phases" -Method Post -Headers $authHeader -Body $phase2Payload -ContentType "application/json"
    $phase2Id = $p2Res.data.id

    Assert-Condition ($phase1Id -ne $null -and $phase2Id -ne $null) "5. Created 2 execution phases (P1: $phase1Id, P2: $phase2Id)"
} catch {
    Assert-Condition $false "5. Create execution phases ($($_.Exception.Message))"
    exit 1
}

# 6. Add Tasks to Phase 1
$task1Payload = @{
    title = "Implement BCrypt & Stateless JWT Filter"
    description = "Configure JwtAuthenticationFilter and SecurityConfig."
    priority = "High"
    dueDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$task2Payload = @{
    title = "Setup Multi-Tenant Access Control Handler"
    description = "Enforce 403 Forbidden for cross-user resource tampering."
    priority = "High"
    dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$task1Id = $null
$task2Id = $null
try {
    $t1Res = Invoke-RestMethod -Uri "$baseUrl/api/phases/$phase1Id/tasks" -Method Post -Headers $authHeader -Body $task1Payload -ContentType "application/json"
    $task1Id = $t1Res.data.id

    $t2Res = Invoke-RestMethod -Uri "$baseUrl/api/phases/$phase1Id/tasks" -Method Post -Headers $authHeader -Body $task2Payload -ContentType "application/json"
    $task2Id = $t2Res.data.id

    Assert-Condition ($task1Id -ne $null -and $task2Id -ne $null) "6. Added 2 actionable tasks to Phase 1 (T1: $task1Id, T2: $task2Id)"
} catch {
    Assert-Condition $false "6. Add tasks ($($_.Exception.Message))"
    exit 1
}

# 7. Complete Task 1 (Verify Cascading Progress: Phase 1 -> 50%)
try {
    $completeT1 = Invoke-RestMethod -Uri "$baseUrl/api/tasks/$task1Id/complete?completed=true" -Method Patch -Headers $authHeader
    
    $p1Check = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId/phases/$phase1Id" -Method Get -Headers $authHeader
    $p1Progress = [int]$p1Check.data.progressPercentage
    Assert-Condition ($p1Progress -eq 50) "7. Completed Task 1: Phase 1 progress cascaded to 50% (actual: $p1Progress%)"
} catch {
    Assert-Condition $false "7. Complete Task 1 and check phase progress ($($_.Exception.Message))"
}

# 8. Complete Task 2 (Verify Phase 1 -> 100% Completed & Goal Progress Updates)
try {
    $completeT2 = Invoke-RestMethod -Uri "$baseUrl/api/tasks/$task2Id/complete?completed=true" -Method Patch -Headers $authHeader

    $p1Check2 = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId/phases/$phase1Id" -Method Get -Headers $authHeader
    $p1Progress2 = [int]$p1Check2.data.progressPercentage
    $p1Status = $p1Check2.data.status
    Assert-Condition ($p1Progress2 -eq 100 -and ($p1Status -eq "Completed" -or $p1Status -eq "COMPLETED")) "8. Completed Task 2: Phase 1 progress reached 100% and marked Completed"

    $goalCheck = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId" -Method Get -Headers $authHeader
    $goalProgress = [int]$goalCheck.data.progress
    Assert-Condition ($goalProgress -eq 50) "9. Goal overall progress automatically cascaded to 50% (1 of 2 phases complete)"
} catch {
    Assert-Condition $false "8-9. Complete Task 2 and check goal cascading progress ($($_.Exception.Message))"
}

# 10. Verify Achievement Unlocks
try {
    $achievements = Invoke-RestMethod -Uri "$baseUrl/api/achievements/check" -Method Post -Headers $authHeader
    $unlockedCount = [int]$achievements.data.unlockedCount
    Assert-Condition ($unlockedCount -gt 0) "10. Milestone achievement unlocked automatically (unlocked count: $unlockedCount)"
} catch {
    Assert-Condition $false "10. Check achievement unlocks ($($_.Exception.Message))"
}

# 11. Verify Dashboard Statistics Update
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/progress/statistics" -Method Get -Headers $authHeader
    $statTasks = [int]$stats.data.totalTasks
    $statCompletedTasks = [int]$stats.data.completedTasks
    $statGoals = [int]$stats.data.totalGoals
    Assert-Condition ($statGoals -eq 1 -and $statTasks -eq 2 -and $statCompletedTasks -eq 2) "11. Dashboard statistics accurately reflect 1 goal, 2 tasks total, 2 completed"
} catch {
    Assert-Condition $false "11. Verify statistics ($($_.Exception.Message))"
}

# 12. Verify Calendar Events Aggregation
try {
    $calEvents = Invoke-RestMethod -Uri "$baseUrl/api/calendar/events" -Method Get -Headers $authHeader
    $eventCount = $calEvents.data.Count
    Assert-Condition ($eventCount -gt 0) "12. Calendar aggregated $eventCount events (goal target dates & completed task milestones)"
} catch {
    Assert-Condition $false "12. Calendar events ($($_.Exception.Message))"
}

# 13. Verify Notifications Generation & Read
try {
    $notifs = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -Headers $authHeader
    $notifCount = $notifs.data.Count
    Assert-Condition ($notifCount -gt 0) "13. Notifications feed generated $notifCount updates"

    if ($notifCount -gt 0) {
        $firstNotifId = $notifs.data[0].id
        $readRes = Invoke-RestMethod -Uri "$baseUrl/api/notifications/$firstNotifId/read" -Method Patch -Headers $authHeader
        Assert-Condition ($readRes.data.isRead -eq $true) "13b. Notification $firstNotifId successfully marked as read"
    }
} catch {
    Assert-Condition $false "13. Notifications check ($($_.Exception.Message))"
}

# 13c. Edit Goal
try {
    $editPayload = @{
        title = "Master Cloud Architecture & Spring Boot 3 (Updated)"
        description = "Updated description for enterprise readiness."
        category = "Career"
        priority = "High"
    } | ConvertTo-Json
    $editRes = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId" -Method Put -Headers $authHeader -Body $editPayload -ContentType "application/json"
    Assert-Condition ($editRes.data.title -eq "Master Cloud Architecture & Spring Boot 3 (Updated)") "13c. Edit Goal successfully updated title"
} catch {
    Assert-Condition $false "13c. Edit Goal ($($_.Exception.Message))"
}

# 13d. Delete Test Task & verify progress recalculation
try {
    $delRes = Invoke-RestMethod -Uri "$baseUrl/api/tasks/$task2Id" -Method Delete -Headers $authHeader
    Assert-Condition ($delRes.success -eq $true) "13d. Delete test task successfully executed"
} catch {
    Assert-Condition $false "13d. Delete test task ($($_.Exception.Message))"
}

# 13e. Logout & Re-login (Session Persistence Verification)
try {
    $reLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $newAuthHeader = @{ "Authorization" = "Bearer $($reLoginRes.data.token)" }
    $persistedGoal = Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId" -Method Get -Headers $newAuthHeader
    Assert-Condition ($persistedGoal.data.id -eq $createdGoalId -and $persistedGoal.data.title -eq "Master Cloud Architecture & Spring Boot 3 (Updated)") "13e. Logout, Login again: All data persisted cleanly in database"
} catch {
    Assert-Condition $false "13e. Persistence check ($($_.Exception.Message))"
}

# 14. Multi-Tenant Security & Isolation Check (Attacker User B)
Write-Host "`n--- Multi-Tenant Security & Isolation Check ---" -ForegroundColor Yellow
$userBEmail = "bob.attacker.$timestamp@goalforge.io"
$regBPayload = @{
    fullName = "Bob Attacker"
    email = $userBEmail
    password = "Password123!"
} | ConvertTo-Json

try {
    $regBRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regBPayload -ContentType "application/json"
    $userBToken = $regBRes.data.token
    $userBHeader = @{ "Authorization" = "Bearer $userBToken" }

    # Attempt 1: User B tries to GET User A's Goal
    $bAccessBlocked = $false
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/goals/$createdGoalId" -Method Get -Headers $userBHeader
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) { $bAccessBlocked = $true }
    }
    Assert-Condition $bAccessBlocked "14a. User B accessing User A's Goal -> 403 Forbidden"

    # Attempt 2: User B tries to mutate User A's Task
    $bTaskBlocked = $false
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/tasks/$task1Id/complete?completed=false" -Method Patch -Headers $userBHeader
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) { $bTaskBlocked = $true }
    }
    Assert-Condition $bTaskBlocked "14b. User B tampering with User A's Task -> 403 Forbidden"
} catch {
    Assert-Condition $false "14. Multi-tenant security setup ($($_.Exception.Message))"
}

# 15. Unauthenticated Access Denial (Simulate Logout / Expired Token)
Write-Host "`n--- Unauthenticated Access Denial Check ---" -ForegroundColor Yellow
$unauthBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/goals" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) { $unauthBlocked = $true }
}
Assert-Condition $unauthBlocked "15. Unauthenticated request without JWT -> 401 Unauthorized"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " RESULTS: $passCount PASSED, $failCount FAILED" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "================================================================" -ForegroundColor Cyan

if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
