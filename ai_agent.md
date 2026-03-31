# 🤖 AI Agent Setup Guide — AI Hackathon 2026 AWS Setup

> **This file is designed to be followed by AI coding agents (Cursor, Claude, etc.).**
> It provides structured, executable instructions for setting up the AWS CLI and AWS SSO required for the AI Hackathon 2026 on BOTH macOS and Windows.

---

## ⚠️ STRICT RULES FOR THE AI AGENT (READ FIRST)
1. **YOU ARE THE ACTOR:** Do NOT just print these instructions out to the user. YOU must use your terminal tool to execute the bash/PowerShell commands listed below. 
2. **DO NOT STOP EARLY:** Execute the steps sequentially. Do not ask the user to run commands. You run them.
3. **HANDLING BLOCKING COMMANDS:** In Step 3, `aws sso login` will block the terminal while the user interacts with their browser. You must run the command, let the terminal hang, and patiently wait for the success exit code. Do NOT abort or ask the user to run it. 

---

## 🛑 HUMAN PRE-REQUISITES (Read Before Running)

Before you ask the AI to run this guide, ensure you have the correct access for the hackathon. 
1. **AWS SSO Access:** Active Okta/SSO access to `https://d-906769fa6b.awsapps.com/start/#`.
2. **Hackathon Account:** Access to the **AI Hackathon 2026** Account (Account ID: `092201263078`).
3. **Role Assignment:** Assigned the **`AWSAdministratorAccess`** permission set.

---

## STEP 0: Pre-flight OS & Environment Check

AI AGENT: Execute these commands in the terminal to check the environment. Do not ask the user to do it.

**OS Detection:**
- Mac/Linux: `uname -a`
- Windows: `[System.Environment]::OSVersion.VersionString` (PowerShell)

**Check AWS CLI:**
- Mac/Win: `aws --version 2>&1`

**Check Default SSO Profile:**
- Mac: `grep -c "AWSAdministratorAccess" ~/.aws/config 2>/dev/null`
- Win: `Select-String -Path ~/.aws/config -Pattern "AWSAdministratorAccess" -Quiet`

*If AWS CLI is installed AND the profile is configured, skip to Step 3. Otherwise, proceed to Step 1.*

---

## STEP 1: Install AWS CLI v2

AI AGENT: If `aws --version` failed, execute the installation for the detected OS.

**Install (macOS)**
```bash
curl "[https://awscli.amazonaws.com/AWSCLIV2.pkg](https://awscli.amazonaws.com/AWSCLIV2.pkg)" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
rm AWSCLIV2.pkg
```
*(Tell the user to check their terminal to enter their sudo password if prompted).*

**Install (Windows - PowerShell)**
```powershell
msiexec.exe /i [https://awscli.amazonaws.com/AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.msi) /qn
```

---

## STEP 2: Configure the Default SSO Profile

AI AGENT: Execute these commands in the terminal to silently build the `~/.aws/config` file.

```bash
aws configure set sso_session.local_developer.sso_start_url "[https://d-906769fa6b.awsapps.com/start/#](https://d-906769fa6b.awsapps.com/start/#)"
aws configure set sso_session.local_developer.sso_region "us-east-1"
aws configure set sso_session.local_developer.sso_registration_scopes "sso:account:access"

aws configure set default.sso_session "local_developer"
aws configure set default.sso_account_id "092201263078"
aws configure set default.sso_role_name "AWSAdministratorAccess"
aws configure set default.region "us-east-1"
aws configure set default.output "json"
```

---

## STEP 3: AWS SSO Login (THE BLOCKING STEP)

AI AGENT: This is a critical step. Follow exactly.

1. **MESSAGE THE USER:** Tell the user: *"I am starting the AWS login process. A browser window will open shortly. Please click 'Allow' or 'Confirm' in the browser. I will wait here until you are done."*
2. **EXECUTE:** Run this command in the terminal:
   ```bash
   aws sso login
   ```
3. **WAIT:** The terminal will block. Wait patiently. 
4. **CONTINUE:** Once the command exits successfully, immediately proceed to Step 4.

---

## STEP 4: Automated Verification

AI AGENT: Execute this command to prove the login worked.

```bash
aws sts get-caller-identity
```
*Look at the output. If the Arn contains "AWSAdministratorAccess", the setup is 100% complete.*

---

## 📊 FINAL STATUS REPORT

AI AGENT: Print this final success message to the user.

> 🚀 **Hackathon Setup Complete!**
> Your AWS CLI is fully configured and authenticated as an Administrator
> To start building your AI Agent, simply type the following in your terminal:
> `agentcore dev`