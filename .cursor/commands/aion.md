# /aion

Use Aion for this request.

## Mode commands

If the request is `set mode <value>`, call `aion_set_mode`.

If the request is `get mode`, call `aion_get_mode`.

Otherwise call `aion_run_goal`.

## Arguments

Always pass:

```json
{
  "project_root": "<current workspace root>",
  "goal": "<user request>"
}
```

If the user includes a mode, pass it exactly as `mode`.

Do not put `"tool"` inside the argument payload.

## Supported modes

```text
1 2 3 4 5 6 7 8 9 10
fast balanced deep max auto
```

## Examples

```text
/aion set mode auto
/aion set mode 10
/aion get mode
/aion improve error handling in this repo
/aion add a safe validation check and run tests
```

After Aion completes, read status and call `aion_get_report` if needed. Summarize session id, status, changed files, validation, and report path.
