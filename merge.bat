@echo off
setlocal enabledelayedexpansion

set "REPO=vibecode-ting/employee-milestone-notifications-ai"

:merge_loop
echo.
echo ========================================================
echo       Admin PR Merge Helper (Bypass ^& Auto-Restore)
echo ========================================================
echo.

set "PR_NUM="
set /p PR_NUM="Enter PR number to merge (or 'q' to quit): "

if "%PR_NUM%"=="" goto done
if /i "%PR_NUM%"=="q" goto done
if /i "%PR_NUM%"=="quit" goto done
if /i "%PR_NUM%"=="exit" goto done

echo.
echo [1/5] Checking PR status...
gh pr view %PR_NUM% --json title,state,mergeable

echo.
echo [2/5] Temporarily disabling admin enforcement on branch protection...
gh api -X DELETE repos/%REPO%/branches/main/protection/enforce_admins
gh api -X PATCH repos/%REPO%/branches/main/protection/required_pull_request_reviews -f dismiss_stale_reviews=false -F required_approving_review_count=0

echo.
echo [3/5] Merging PR #%PR_NUM% with squash...
gh pr merge %PR_NUM% --squash --admin

echo.
echo [4/5] Restoring branch protection rules...
gh api -X POST repos/%REPO%/branches/main/protection/enforce_admins
gh api -X PATCH repos/%REPO%/branches/main/protection/required_pull_request_reviews -f dismiss_stale_reviews=false -F required_approving_review_count=1

echo.
echo [5/5] Final verification:
gh pr view %PR_NUM% --json state,mergedAt

echo.
echo ========================================================
echo PR #%PR_NUM% completed. Next PR?
echo ========================================================
goto merge_loop

:done
echo.
echo ========================================================
echo Exiting merge helper.
echo ========================================================
echo.
