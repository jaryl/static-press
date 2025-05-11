---
description: Generates a git commit message from staged changes
---

* If a diff wasn't provided by the user prompt perform `git diff --staged`
* If no staged changes, inform the user, otherwise, generate a commit message
