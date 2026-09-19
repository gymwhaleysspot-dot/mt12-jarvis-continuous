# MomTo

Persistent, privacy-first adoption-search subsystem for Jarvis.

## Mission
Maintain an active, lawful search for Michael Whaley (birth name Michael Braggs, born 1980) to locate both birth mother and birth father. The case remains active until the user explicitly closes it or both objectives are resolved.

**This tool does not provide legal advice. Consult an attorney or adoption professional.**

MomTo does not bypass sealed records, hack databases, scrape private services, dox people, or automate intrusive contact.

## Privacy
Real case data belongs in the local case database, never in public fixtures, tests, logs, or commits. No telemetry is included.


## Private case vault

The private case vault is the evidence layer for real case work. It is encrypted
with Fernet and stored only in the local filesystem. Documents, evidence,
people, relationships, DNA observations, searches, hypotheses, and tasks are
never written to GitHub or the public MomTo snapshot.

Create a key locally:

    momto vault key

Set it in the local environment as `MOMTO_VAULT_KEY`, then initialize and use
the vault:

    momto vault init
    momto vault ingest /path/to/private-record.pdf
    momto vault summary
    momto vault list document

The public worker must continue to operate without the private vault. This
separation is intentional: GitHub Actions can research public sources, while
real adoption records and lawful DNA evidence stay local and encrypted.

Never commit the vault directory, database, keys, exported records, or real
case data. Use the local OS/disk security controls for protecting the vault key
and the machine that stores the vault.
