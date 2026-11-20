# Pickup tracker setup

The private Share The Care Pickups base and all five grid views have now been created in the organization Airtable account. The application migration is not deployed yet. Gmail authorization, automation tests, runtime access, and Vercel release checks are separate steps; code and mocked tests do not complete those steps. Use the existing base rather than creating a duplicate.

## Accounts and access

Use `srsharethecare@gmail.com` as the Airtable owner and the connected Gmail sender. Keep the base private. Invite individual team accounts only when the owner provides the intended people and access levels.

The Airtable ChatGPT connection helps manage the table. The deployed website separately needs a server-only personal access token; the ChatGPT connection does not automatically supply a runtime credential.

1. Finish Airtable sign-in using the organization account.
2. Create the base using `pickup-base.json` and the [Create base API](https://airtable.com/developers/web/api/create-base), or create the same fields in the UI. The JSON is a schema definition, not a file that Airtable's CSV importer can import. Set `workspaceId` when calling the API.
3. For API creation, a temporary setup token needs `schema.bases:write` and access to the intended workspace. The runtime token needs `data.records:read` and `data.records:write` and access to the new base. Revoke the setup token when finished. Don't paste either token into chat, Git, or browser frontend configuration.
4. Record the base ID (`app…`) and Pickup Requests table ID (`tbl…`). Store runtime settings in Vercel project environment variables; use `.env.example` for the names. Set `PICKUP_ACCEPTING_REQUESTS=false` until the complete workflow has passed its setup test.

If an Airtable schema option is rejected by the current API, use the UI to create that field and verify the final schema before enabling intake. The prepared schema has not yet been submitted to a real account.

## Team views

All views use the same Pickup Requests table. Hide Submission key from normal views; never edit it.

| View | Filter / use |
|---|---|
| All requests | Everything, newest Submitted at first |
| New / needs contact | Status is empty or New; show donor details, email states, assigned volunteer, and notes |
| Scheduled | Status is Scheduled; sort by Scheduled pickup |
| Picked up | Status is Picked up |
| Email needs attention | Either email status is empty, Pending, or Needs attention; exclude very recent records when reviewing for failures |

Status choices: New, Contacted, Scheduled, Picked up, Cancelled. Assigned volunteer is text until the owner supplies the team membership. Submitted at is Airtable's creation time, so retries do not move the original date.

## Organization Gmail automation

Use Airtable's **Gmail: Send email** action, connected through Google's authorization screen as `srsharethecare@gmail.com`. Do not use the generic Airtable Send email action for donor acknowledgements on a Free plan; that action restricts recipients to verified base collaborators. Current Airtable help pages disagree about whether Gmail actions require a paid plan, so confirm actual availability in this workspace. Do not start a paid subscription without the owner's decision.

Create **two independent automations**, each triggered **When a record is created** in Pickup Requests. Triggering on creation prevents ordinary visitor retries or staff edits from resending emails. Keeping the triggers separate ensures that a donor-send failure does not suppress the organization's notification.

Donor acknowledgement automation:

1. Update Confirmation status = Pending on the created record.
2. Gmail Send email to the record's Email field, From name = Share The Care, Reply-To = `srsharethecare@gmail.com`. Use the donor template below.
3. Update Confirmation status = Sent.

Team notification automation:

1. Update Notification status = Pending on the created record.
2. Gmail Send email to `srsharethecare@gmail.com`, From name = Share The Care, Reply-To = the donor's Email field. Use the team template below.
3. Update Notification status = Sent.

Set Status to default to New in the table if the workspace supports that default. Otherwise an empty Status means a new request and is included in New / needs contact. Neither email automation resets Status, volunteer assignments, dates, or notes.

Airtable currently allows 100 automation runs per month on Free, and failed attempts also count. Two email automations consume two runs per request, so Free supports at most about 50 fully automated requests per month, less after tests/retries. Confirm expected volume and the owner's plan decision before opening intake; the automatic 14-day Team trial has a larger allowance and is not proof the Free configuration will suffice. [Automation limits](https://support.airtable.com/articles/3669392397-getting-started-with-airtable-automations)

Test the action using a clearly labeled test record and confirm receipt in both inboxes before enabling the automation. A successful send action means the provider accepted the message, not guaranteed delivery or a pickup appointment. Monitor Airtable's automation run allowance and Gmail's sending allowance before collection drives.

### Donor acknowledgement

Subject: `We received your donation request — {{Request ID}}`

```text
Hi {{Name}},

Thank you for supporting Share The Care! We've received your donation request.
Our team will contact you soon to coordinate a pickup. Your pickup date and time have not been confirmed yet.

Your reference: {{Request ID}}

If you need to update your request, reply to this email.

Thank you,
The Share The Care team
srsharethecare@gmail.com
```

### Team notification

Subject: `New pickup request — {{Neighborhood}} — {{Request ID}}`

```text
New donation pickup request

Reference: {{Request ID}}
Name: {{Name}}
Email: {{Email}}
Neighborhood: {{Neighborhood}}
Pickup address: {{Pickup address}}
Donation details: {{Donation details}}

Reply to this message to contact the donor. Update the pickup's status,
assigned volunteer, scheduled date, and notes in the private Airtable tracker.
```

Insert real dynamic field tokens using Airtable's UI. The braces above describe the template; pasting them as plain text does not create dynamic values.

### Failure recovery

The website reports success once Airtable confirms the saved record, independently of whether the asynchronous emails have sent. If email actions fail, keep the original request and inspect the Email needs attention view and automation run history. Verify Gmail's Sent folder before retrying an uncertain send. For each pending message separately: inspect the corresponding automation run and Gmail Sent, search by Request ID and recipient, and confirm whether the original message exists. If it was sent, mark only that email's status Sent. If it was not sent, compose the matching template in the organization Gmail account (donor or team notification as appropriate), verify the recipient and Reply-To, send it, then mark only that status Sent. An operator with the necessary access can alternatively rerun only the failed email automation after verifying it will not duplicate a send. There is no shared initialization automation to rerun. Gmail email sending does not provide an exactly-once delivery guarantee.

If the workspace's available automation features cannot support safe recovery, leave intake disabled until we choose and test an alternative sender. Do not mark pending emails Sent just to clear the view.

## Vercel and release checks

- Add `AIRTABLE_ACCESS_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, and `PICKUP_ACCEPTING_REQUESTS` to the existing STC project. Credentials are server-only; never prefix them with `VITE_`.
- `PICKUP_ALLOWED_ORIGINS` defaults to the canonical site and its www address. Add local origins only to local/preview settings when testing. Origin checking and the honeypot are not a complete bot defense; configure and verify Vercel Firewall request throttling/bot protection for `/api/pickup` before opening automated Gmail sending to the public.
- The frontend calls `/api/pickup`. Vercel serves the Web Request/Response function at `api/pickup.ts`; plain `vite` serves only the frontend. Use Vercel's local development runner or a configured preview deployment for full backend testing.
- In a protected preview or local backend environment, configure the test base and both email automations, set `PICKUP_ACCEPTING_REQUESTS=true` for that environment only, and verify required fields and rejection of malformed, oversized, and cross-origin requests. Keep production disabled throughout this test.
- Submit a clearly labeled test. Confirm one Airtable record, the original Submitted at timestamp, both actual emails, donor Reply-To on the team notification, and the displayed request reference.
- Retry the same request with its same submission ID. Verify it reuses the record and does not reset status, notes, assignment, or email state.
- Set `PICKUP_ACCEPTING_REQUESTS=true` only when account setup, automation, abuse protection, and actual delivery have been checked. Deploy the working cutover; verify the public domain before considering the migration complete.

Historical FormSubmit messages remain in the personal Gmail account. Import real historical requests into Airtable separately after the owner specifies whether they should be migrated; never replay them through the new donor acknowledgement automation.
