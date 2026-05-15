# Decisions

## [2026-04-27] Session Start
- Year boundary: clip silently (no UI indicator)
- duration=0/negative: clamp to 1, emit warning
- remark filter divergence: preserve (caller-side, not shared service)
- Bases API types: stub interfaces in src/type/BasesTypes.ts
- NoteEventService: remove cache entirely (never used), switch to metadataCache for reads
- isSaving: move to React useState in EventForm, onSave becomes Promise<void>
- Task 8 commit: separate from Task 7 (plan says "group with Task 7" but each has own commit message)
