# Bitrix24 Integration Assessment — 2026-08-28

## Verified official capabilities

- Bitrix24 supports an **incoming webhook** for server-to-Bitrix REST calls. Its secret URL executes with the creating employee's permissions and selected scopes. The secret must remain server-side and must not be exposed in browser code.
- Bitrix24 supports an **outgoing webhook** for change events to a publicly reachable HTTPS handler. The handler receives `application/x-www-form-urlencoded` data with an event and object identifier; it should fetch full CRM data separately.
- The incoming and outgoing webhook approach suits one Bitrix24 account. A reusable application/OAuth is preferable only when richer installation or multi-account support is needed.
- Outgoing requests must verify `auth[application_token]` against the value configured in Bitrix24. Bitrix24 warns that outgoing webhooks have no retries, so the receiver must acknowledge rapidly and log failures for reconciliation.

## Product implication

For this single-company CRM, a safe two-way first release can use: an incoming webhook stored as a server secret for outbound updates from Saadiyat Resale Hub, plus an outgoing webhook into a signed project endpoint for inbound changes from Bitrix. A durable reconciliation record, conflict policy, field mapping, and an initial import preview are required before writes are enabled.

## Deferred status

The user deferred Bitrix24 implementation on 28 Aug 2026 to prioritise remaining website work. No connector, API secret, endpoint, schema migration, CRM read, or CRM write has been created. Resume only after the user explicitly requests it and provides the Bitrix portal domain, entity type/ID, documented field map, conflict rule, owner-data approval policy, and an approved authentication route. Credentials must be added server-side through the project secret workflow and must never be added to browser code, repository files, or command lines.

## Sources

- [Incoming and Outgoing Webhooks — Bitrix24 REST API](https://apidocs.bitrix24.com/local-integrations/local-webhooks.html)
- [Events — Bitrix24 REST API](https://apidocs.bitrix24.com/api-reference/events/index.html)
- [Authorization in REST — Bitrix24 REST API](https://apidocs.bitrix24.com/settings/how-to-call-rest-api/authorization.html)
