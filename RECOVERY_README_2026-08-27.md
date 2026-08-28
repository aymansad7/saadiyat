# Saadiyat Project Recovery Archive — 2026-08-27

This dated archive contains the current project source code, application data files, database schema and migrations, test files, scripts, and project documentation.

## Deliberately excluded

The archive does not include `node_modules`, build output, Git metadata, dev-server logs, temporary files, coverage, or environment files/secrets. Restore dependencies with `pnpm install` after extracting the archive.

## Remote resources

The production database is managed remotely and is not exported inside this archive. Static storage URLs remain referenced in the code; the source rendition of the approved Saadiyat logo is included separately from `/home/ubuntu/webdev-static-assets/` under `webdev-static-assets/` in the archive.

## Restore outline

1. Extract the archive.
2. In the `saadiyat` directory, run `pnpm install`.
3. Configure the required environment variables through the project secrets interface; do not place secret values in source control.
4. Verify database connectivity before applying migrations.
5. Run `pnpm exec tsc --noEmit` and `pnpm vitest run` before publishing.
