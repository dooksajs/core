## Git Commit Message Convention

> This is adapted from [Angular's commit convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

#### TL;DR:

Messages must be matched by the following regex:

```regexp
/^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/
```

#### Examples

Appears under "Features" header, `action` subheader:

```
feat(action): add 'comments' option
```

Appears under "Bug Fixes" header, `operator` subheader, with a link to issue #42:

```
fix(operator): use notNull operator close #42
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```
perf(component): improve appending children by removing 'foo' option

BREAKING CHANGE: The 'foo' option has been removed.
```

The following commit and commit `5e0aedc` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```
revert: feat(operator): add 'comments' option

This reverts commit 3c98feef27255d1da645c65285561eb70e320679.
```

### Full Message Format

A commit message consists of a **header**, **body** and **footer**. The header has a **type**, **scope** and **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body, it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However, if there is any [BREAKING CHANGE](#footer), the commit will always appear in the changelog.

Other prefixes are up to your discretion. Suggested prefixes are `docs`, `chore`, `style`, `refactor`, and `test` for non-changelog related tasks.


#### Prefixes

- `build`: Changes that affect the build system or external dependencies (example scopes)
- `chore`: Updating tasks with no production code change
- `ci`: Changes to our CI configuration files and scripts
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `revert`: Revert a commit
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, removing semi-columns, etc)
- `test`: Adding missing tests or correcting existing tests
- `types`: JSDocs documentation
- `wip`: Code that is work-in-progress


### Scope

The scope could be anything specifying the place of the commit change. For example `core`, `operator`, `action`, `get-value` etc...

### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
