<#
.SYNOPSIS
  Lock the symcio-send-email Azure AD app down to ONLY your mailboxes.

.DESCRIPTION
  App-only Graph Mail.Send can, by default, send as ANY mailbox in the tenant.
  This script creates an Exchange ApplicationAccessPolicy so the app can only
  send as the listed mailboxes (info@symcio.tw, sall@symcio.tw). Strongly
  recommended for least-privilege.

  Run on YOUR machine with Exchange Online PowerShell — only a tenant admin can
  create this policy, so it can't be delegated to a server.

.PREREQUISITES
  Install-Module ExchangeOnlineManagement -Scope CurrentUser
  Connect-ExchangeOnline -UserPrincipalName admin@symcio.tw

.PARAMETER AppId
  The Application (client) ID printed by scripts/setup-email.sh.

.EXAMPLE
  ./scripts/restrict-mailboxes.ps1 -AppId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#>
param(
  [Parameter(Mandatory = $true)] [string] $AppId,
  [string[]] $Mailboxes = @("info@symcio.tw", "sall@symcio.tw"),
  [string]   $GroupName = "SendEmailApp-Mailboxes"
)

$ErrorActionPreference = "Stop"

# 1. A mail-enabled security group that holds the allowed mailboxes.
$existing = Get-DistributionGroup -Identity $GroupName -ErrorAction SilentlyContinue
if (-not $existing) {
  Write-Host "Creating security group '$GroupName'…"
  New-DistributionGroup -Name $GroupName -Type Security -Members $Mailboxes | Out-Null
} else {
  Write-Host "Group '$GroupName' exists; ensuring members…"
  foreach ($m in $Mailboxes) {
    Add-DistributionGroupMember -Identity $GroupName -Member $m -ErrorAction SilentlyContinue
  }
}

$groupAddress = (Get-DistributionGroup -Identity $GroupName).PrimarySmtpAddress
Write-Host "Group address: $groupAddress"

# 2. The access policy restricting the app to that group.
Write-Host "Creating ApplicationAccessPolicy (RestrictAccess) for app $AppId…"
New-ApplicationAccessPolicy `
  -AppId $AppId `
  -PolicyScopeGroupId $groupAddress `
  -AccessRight RestrictAccess `
  -Description "Limit symcio-send-email to approved mailboxes" | Out-Null

# 3. Verify: allowed mailbox should be Granted, a random one Denied.
Write-Host "`nVerification:"
foreach ($m in $Mailboxes) {
  Test-ApplicationAccessPolicy -AppId $AppId -Identity $m |
    Select-Object Identity, AccessCheckResult | Format-Table -AutoSize
}

Write-Host "`nDone. The app can now send only as: $($Mailboxes -join ', ')"
Write-Host "Note: policy propagation can take up to ~30 minutes."
