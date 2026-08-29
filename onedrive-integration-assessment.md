# OneDrive Central Storage Assessment

## Confirmed Decisions

The user approved Microsoft 365 Business OneDrive as the central file store for Saadiyat Resale Hub and completed sign-in to the authorized business account. The root folder name is **Saadiyat Resale Hub**. The current verified OneDrive session identifies the signed-in owner as Ayman Sadieh and is hosted in the NAS Luxury Microsoft 365 tenant at `nasluxury-my.sharepoint.com`.

The website remains the operational source of truth for editable unit data. It may write a structured Excel workbook to OneDrive as an operational export, but direct edits to that workbook must never overwrite the website database. OneDrive is the file source of truth for source files, brochures, SPAs, and owner documents.

## Access Policy

Each brochure, SPA, or owner document can receive its own OneDrive read-only **anyone-with-the-link** URL. The website must never expose a folder URL, a parent-folder listing, or unrelated document metadata when presenting a single file link. Because possession of a link grants access, SPA and owner-document links must remain absent from all public cards, map responses, search results, and unauthorised APIs. They may be registered, shown, or copied only from permission-filtered administrative workflows.

## Proposed Folder Layout

```text
Saadiyat Resale Hub/
  Operations/
    Saadiyat-Unit-Register.xlsx
  Communities/
    {Community}/
      {Phase-if-applicable}/
        {Canonical-Unit-or-Plot-Key}/
          Brochures/
          SPA/
          Owner-Documents/
          Source-Files/
```

The database will store only the stable unit identity, document classification, OneDrive drive and item identifiers, original name, MIME type, share-link identifier or URL where approved, version marker, timestamps, actor, and audit records. It will not store document bytes, Microsoft passwords, client secrets, or owner files.

## Connection Model

The browser session permits review of folders in OneDrive. The website now uses the approved server-to-server Microsoft Graph client-credentials model for its dedicated single-tenant application. The Microsoft client secret is stored only in the project's secure server configuration. It is never returned through the web application, persisted in the database, source code, log, or OneDrive workbook.

The chosen root-folder design uses Microsoft Graph `Files.ReadWrite.All` as an **Application** permission with tenant admin consent. Microsoft grants this permission at the application level; the Saadiyat application enforces an additional code-level boundary by resolving and accepting only the verified `Saadiyat Resale Hub` root item and rejecting every path outside it. The narrower `Files.ReadWrite.AppFolder` alternative was not selected because it would create a separate `Apps/{application-name}` folder rather than use the approved root-level repository.

## Browser Setup Progress

The authorized OneDrive session is active. The Home-page **Create or upload** control did not expose its creation menu through automated interaction, so folder creation will be continued from the authenticated **My files** view rather than repeating the same interaction.

The My files view loaded successfully and confirms that the account can see its owned OneDrive root and create-or-upload control. Existing files and folders were inspected only to confirm location and ownership; no existing file, folder, sharing setting, or permission was altered.

The create menu presented a Folder option visually, but the browser menu automation did not retain the selected option and the menu then closed. The next attempt will use a focused client-side interaction only to open the standard OneDrive folder-name dialog; folder creation will still require the subsequent explicit form submission.

The standard OneDrive **Create a folder** dialog accepted the user-approved `Saadiyat Resale Hub` name. The folder was created at the root of the authorized OneDrive and is initially private with no contents. A subsequent duplicate-create attempt was rejected by OneDrive because the folder already exists, confirming that the initial creation succeeded. No existing OneDrive file, folder, sharing setting, or permission was changed.

## Tenant Verification

The Microsoft Entra admin centre authenticated successfully as `ayman@nasluxury.com` in the `NAS LUXURY REAL ESTATE LLC (nasluxury.com)` tenant. This verifies the active Microsoft 365 identity and tenant. The earlier user-provided `ayman@naasluxury.com` target is treated as a spelling variant, not a second storage account; the application will connect only to the authenticated OneDrive drive after its explicit authorization completes.

The verified tenant directory ID is `02876a16-e979-40e8-92e7-40a6aa81f0a8`. The App registrations page is open and exposes the standard **New registration** action. The user explicitly approved creation of the dedicated OneDrive application and the documented server-side Graph permission request.

### Registered application — 2026-08-29

The user-approved, single-tenant Microsoft Entra application **Saadiyat Resale Hub OneDrive** has been registered for NAS LUXURY REAL ESTATE LLC. Its non-secret application (client) ID is `e3b9d1f3-f184-4553-8e11-d8a333ad683e`. Its server-only credential has been entered through secure project configuration and was validated by obtaining a Microsoft Graph token. The required `Files.ReadWrite.All` **Application** permission has tenant admin consent and Graph access to the approved business drive has been verified.

## Website Document Model — 2026-08-29

The project database now has a metadata-only `unit_documents` register. It keys every document to the same stable `villaKey` used by the property profile, preserves the community and optional phase, and records its OneDrive `driveId`, `itemId`, parent item, file name, MIME type, version/ETag, uploader, classification, and sharing policy. File bytes, Microsoft passwords, client secrets, access tokens, and refresh tokens do not appear in this register.

`brochure`, `floorplan`, and `marketing` documents may be intentionally marked `card_link`; all other document types default to `master_admin`. In particular, `spa`, `owner_document`, and `source_file` links will not be returned from any public card, map, search, or availability endpoint. Even though Microsoft may generate an anyone-with-the-link URL for a selected file, the website will disclose sensitive document links only from a verified Master Admin workflow.

`onedrive_connections` stores the single non-secret connection state for the approved root folder, while `onedrive_sync_events` is an append-only operation ledger for uploads, metadata refreshes, sharing-link creation, and workbook exports. Its idempotency key prevents repeated work when a request is retried. The current migration added those tables and expanded the existing activity audit with document and OneDrive event types. It made no destructive change or copy of existing files.

## Planned Workbook Contract

`Operations/Saadiyat-Unit-Register.xlsx` is an outbound operational workbook written by the website only. It will contain one row per canonical property profile with its project, phase, unit/plot identity, editable public operational values, audit timestamps, and document counts. It will not contain SPA file links, owner-document links, owner contact values, Microsoft tokens, or file bytes. Changes made directly in Excel will remain informational only and will not be imported into the website database.

## Runtime Verification — 2026-08-29

The verified root folder is active in the OneDrive Business drive. The website generated the first `Operations/Saadiyat-Unit-Register.xlsx` export with 1,536 property profiles, then created `Communities`, `Operations`, and `Operations/Code-Archives` plus a non-sensitive repository README. A recovery source archive was uploaded to `Operations/Code-Archives`; it excludes `.env` files, secrets, dependencies, VCS internals, logs, and build output and has no public share link.

The initial portal setup also added two delegated application-management permissions (`Application.ReadUpdate.All` and `Application.ReadWrite.All`) that are unrelated to OneDrive. The user approved their removal. Microsoft Entra confirmed removal of both permissions from the configured-permissions list. The configured list now contains only `Files.ReadWrite.All` (**Application**) and `User.Read` (**Delegated**), both granted.

Microsoft still shows the two removed application-management permissions under **Other permissions granted** as historical tenant-wide consent records. Selecting the generic revoke action opened a dialog naming `User.Read`, so that action was cancelled rather than revoking an unrelated consent. Before final deployment, the client-credentials token must be inspected for its actual `roles` claim. If either historical application-management role remains in the token, its specific enterprise-application grant must be revoked through the Microsoft admin portal; `Files.ReadWrite.All` remains the only required application role for the integration.

## Verification status

The current client-credentials token was decoded during the OneDrive credential test. It includes `Files.ReadWrite.All` and does **not** include either `Application.ReadWrite.All` or `Application.ReadUpdate.All`. The registered application can read the configured OneDrive Business drive successfully.

The Master Admin page at `/admin/documents` was inspected in a signed-in Master session. It shows a successful OneDrive Business connection, the enforced `Saadiyat Resale Hub` root, the prior workbook-export timestamp, the exact-unit document registration form, and an empty document register. The page is restricted to Master Admin and the public-card pathway remains limited to brochure, floorplan, and marketing files only.

## References

[1] Microsoft Graph, [Working with files in Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0).

[2] Microsoft Graph, [Create a sharing link for a DriveItem](https://learn.microsoft.com/en-us/graph/api/driveitem-createlink?view=graph-rest-1.0).

[3] Microsoft Graph, [Use delta query to track changes](https://learn.microsoft.com/en-us/graph/delta-query-overview).

[4] Microsoft Graph, [Using app folder in OneDrive and SharePoint](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder).

[5] Microsoft Entra, [OAuth 2.0 authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow).
