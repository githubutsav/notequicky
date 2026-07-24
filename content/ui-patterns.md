# UI Pattern Cookbook

This is a compact cookbook for common frontend product screens and components.

Use it after [frontend-design.md](frontend-design.md), [color.md](color.md), [tailwind.md](tailwind.md), [shadcn.md](shadcn.md), and [frontend-testing.md](frontend-testing.md). Those notes explain the foundations and tools. This note focuses on what to include when you build real UI.

Good UI patterns are boring in the best way:

```text
The user knows where they are.
The primary action is obvious.
Loading, empty, error, disabled, and success states exist.
Keyboard and screen-reader behavior works.
Dangerous actions have friction.
The layout survives real content.
```

## 1. Pattern Checklist

Before building any UI pattern, ask:

```text
What is the user's goal?
What information do they need before acting?
What is the primary action?
What secondary actions exist?
What can go wrong?
What does loading look like?
What does empty look like?
What does permission denied look like?
What happens on mobile?
What should keyboard users be able to do?
What should be tested?
```

Common states:

```text
Default
Hover
Focus
Active
Disabled
Loading
Empty
Error
Success
Permission denied
Offline or stale
Long content
Mobile
High zoom
Dark mode
```

If a pattern only looks good with perfect mock data, it is not done.

## 2. Buttons And Actions

Buttons should make action hierarchy clear.

Use:

```text
Primary       main page or modal action
Secondary     normal alternative action
Ghost         low-emphasis action
Destructive   delete, revoke, remove, reset
Icon          compact tool action
Link          navigation, not mutation
```

Rules:

```text
One primary action per area.
Use verbs: Save, Create, Invite, Delete, Export.
Disable only when the reason is obvious or explained.
Show pending state after submit.
Prevent duplicate submission.
Use real button elements for actions.
Use links for navigation.
```

Bad:

```text
Three filled primary buttons in one toolbar.
Clickable divs.
Delete beside Save with equal emphasis.
Spinner with no disabled state.
Icon-only buttons without accessible names.
```

Button test targets:

```text
Can keyboard focus reach it?
Can Enter or Space activate it?
Does pending state prevent duplicate action?
Does destructive action require confirmation when needed?
```

## 3. Forms

Forms are one of the highest-value UI patterns to get right.

Anatomy:

```text
Title or section label
Short explanation when needed
Field labels
Inputs
Help text
Validation errors
Server error area
Primary submit action
Secondary cancel/back action
Pending and success feedback
```

Field rules:

```text
Every input has a label.
Help text explains format or consequence.
Error text says how to fix the problem.
Required fields are clear.
Use correct input types.
Preserve entered values after validation errors.
Put errors near fields.
Summarize form-level errors when helpful.
```

Example structure:

```tsx
function ProfileForm() {
  return (
    <form aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>

      <label htmlFor="name">Name</label>
      <input id="name" name="name" autoComplete="name" />
      <p id="name-help">Use the name teammates will recognize.</p>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" />

      <button type="submit">Save changes</button>
    </form>
  );
}
```

Form states:

```text
Pristine       nothing touched
Dirty          values changed
Invalid        client validation failed
Submitting     request in progress
Server error   backend rejected the request
Success        saved or completed
```

Use React Hook Form and Zod for complex client forms. Use server validation for trust. See [react.md](react.md#26-forms-with-react-hook-form-and-zod), [frontend-design.md](frontend-design.md#forms-and-validation), and [frontend-testing.md](frontend-testing.md#10-testing-forms).

## 4. Settings Pages

Settings pages are usually repeated forms grouped by topic.

Good structure:

```text
Page title
Short page description
Sidebar or tabs for sections
Grouped setting panels
Clear save/cancel behavior
Danger zone separated from normal settings
Audit or last-updated metadata when useful
```

Patterns:

```text
Profile settings        normal form
Security settings       password, sessions, 2FA, recovery
Billing settings        plan, invoices, payment method
Notification settings   grouped toggles
Team settings           member table + invite action
Danger zone             destructive actions with confirmation
```

Rules:

```text
Do not mix destructive actions into normal save flows.
Do not make every setting auto-save unless feedback is excellent.
For auto-save, show saved/saving/failed status.
For manual save, make unsaved changes visible.
Keep sections scannable and stable.
```

Test:

```text
Changing a field enables Save.
Submitting shows pending feedback.
Server errors appear without losing input.
Navigation warns or preserves unsaved changes when needed.
Danger zone cannot be triggered accidentally.
```

## 5. Dashboards

Dashboards are for scanning, comparison, and action.

Good dashboard anatomy:

```text
Title and time range
Primary filters
KPI summary
Chart or trend area
Table or recent activity
Alerts or exceptions
Export/share action when needed
```

KPI card rules:

```text
Use a clear label.
Show value with unit.
Show comparison period only when meaningful.
Use color as support, not the only meaning.
Keep numbers aligned and formatted consistently.
Avoid decorative cards that do not drive decisions.
```

Chart rules:

```text
Label axes or provide direct labels.
Show units.
Provide empty and loading states.
Avoid too many colors.
Use table fallback when exact values matter.
Explain unusual spikes or missing data.
```

Dashboard mistakes:

```text
Everything is a card.
No date range.
Charts with no units.
Tiny legends far from data.
No empty state.
No drill-down path.
No permission or data freshness indicator.
```

See [color.md](color.md#8-data-visualization-colors) for chart color guidance.

## 6. Tables

Tables are for comparison and repeated actions.

Use a table when:

```text
Rows share the same fields.
Users compare values across rows.
Sorting or filtering matters.
Bulk actions matter.
Exact values matter.
```

Anatomy:

```text
Title
Description or count
Search/filter controls
Column headers
Rows
Row actions
Bulk selection
Pagination or infinite loading
Empty state
Export if needed
```

Column rules:

```text
Put the most identifying column first.
Align numbers to the right.
Keep dates in a consistent format.
Use badges for status only when labels remain readable.
Hide low-value columns on mobile.
Do not truncate critical values without a way to inspect.
```

Row action rules:

```text
Primary row action can be the row link.
Secondary actions go in a menu.
Destructive row actions need confirmation.
Bulk actions appear only after selection.
Selection state is obvious.
```

Empty state examples:

```text
No invoices yet.
No invoices match "acme".
You do not have permission to view invoices.
Invoices could not be loaded.
```

Choose semantic tables for simple data, TanStack Table for custom table logic, and AG Grid for enterprise grid power. See [frontend-design.md](frontend-design.md#tables-and-data-grids).

## 7. Filters And Search

Filters should explain what data the user is seeing.

Anatomy:

```text
Search input
Filter controls
Active filter chips
Result count
Clear all action
Saved views when useful
Empty no-results state
```

Rules:

```text
Debounce network search.
Keep filter state in the URL when sharing/back/refresh matters.
Show active filters near results.
Make Clear all easy.
Use good defaults.
Avoid hidden filters that silently change results.
```

Search states:

```text
No query
Typing
Loading results
Results found
No results
Search failed
```

No-results copy should mention the query or filters:

```text
No customers match "acme" with Status: Archived.
```

## 8. Empty States

Empty states are not blank spaces. They explain what happened and what to do next.

Types:

```text
First use       no data exists yet
No results      filters/search removed all results
Permission      user cannot see data
Error           data could not load
Archived        data exists elsewhere
```

Anatomy:

```text
Short title
Useful explanation
Primary action when available
Secondary action or docs link when useful
Optional illustration only if it helps
```

Examples:

```text
First use:
No projects yet.
Create your first project to start tracking work.

No results:
No projects match these filters.
Clear filters or try another search.

Permission:
You do not have access to this workspace.
Ask an admin to update your role.
```

Do not use cute copy when the user is blocked or stressed.

## 9. Loading States

Loading UI should preserve layout and reduce uncertainty.

Use:

```text
Skeletons      page/card/table structure is known
Spinner        short unknown wait
Progress       long or multi-step operation
Optimistic UI  fast reversible actions
Inline pending form state
```

Rules:

```text
Keep layout stable.
Show loading near the affected area.
Disable duplicate actions during mutation.
Use skeletons that match final content shape.
Avoid full-page spinners for partial updates.
```

Good loading states:

```text
Table rows skeleton while invoices load.
Save button changes to Saving and disables.
Chart area skeleton preserves height.
File upload shows progress per file.
```

Bad loading states:

```text
Entire dashboard disappears for one filter change.
Spinner shifts layout.
User can submit the same form twice.
No indication that anything is happening.
```

## 10. Error States

Errors should help the user recover.

Types:

```text
Field validation error
Form-level server error
Page load error
Permission error
Network/offline error
Conflict/stale data error
Unexpected crash
```

Rules:

```text
Explain what happened in plain language.
Say what the user can do.
Preserve user input.
Offer retry when retry can help.
Avoid leaking internal error details.
Log unexpected errors for developers.
```

Examples:

```text
Email is required.
That email is already invited.
Invoices could not be loaded. Retry.
This project changed since you opened it. Review the latest version.
You do not have permission to delete this workspace.
```

Use route error boundaries for unexpected rendering failures. Use normal UI state for expected validation and permission errors. See [nextjs.md](nextjs.md#14-error-handling-and-not-found-ui).

## 11. Dialogs And Modals

Use dialogs for focused decisions or workflows that should interrupt the current page.

Good uses:

```text
Confirm destructive action
Create small object
Edit a small set of fields
Show details without losing list context
Command or picker workflow
```

Avoid dialogs for:

```text
Long multi-step forms
Large tables
Full-page settings
Complex navigation
Content that needs a shareable URL
```

Dialog rules:

```text
Title describes the task.
Focus moves into the dialog.
Escape closes when safe.
Focus returns to the trigger.
Background is inert.
Primary and cancel actions are clear.
Destructive action is visually distinct.
```

Delete confirmation pattern:

```text
Title: Delete project?
Body: This permanently deletes project data and cannot be undone.
Cancel: Cancel
Primary destructive: Delete project
```

For high-risk deletion, require typed confirmation or an additional step.

## 12. Command Menus

Command menus are for fast navigation and actions.

Good uses:

```text
Search pages
Open records
Run common commands
Switch workspaces
Jump to settings
Create new objects
```

Anatomy:

```text
Keyboard shortcut
Search input
Grouped results
Empty state
Keyboard selection
Recent or suggested items
Clear action labels
```

Rules:

```text
Every result has a clear label.
Show group names when results differ by type.
Keep destructive actions separated.
Support arrow keys, Enter, and Escape.
Do not hide essential workflows only inside the command menu.
```

Example groups:

```text
Pages
Projects
People
Actions
Settings
```

Test keyboard flow carefully.

## 13. Uploads

Uploads combine file selection, validation, progress, preview, network, and error recovery.

Anatomy:

```text
Drop zone or file picker
Accepted file types
Size limits
Selected file list
Per-file status
Progress
Remove/cancel action
Error messages
Retry action
```

Rules:

```text
Always provide a normal file picker.
Do not make drag/drop the only path.
Validate type and size on client for UX.
Validate type and size on server for trust.
Show per-file errors.
Let users remove a selected file before upload.
Do not upload private files to production accidentally in tests.
```

States:

```text
Idle
Drag over
Selected
Uploading
Uploaded
Failed
Canceled
Too large
Wrong type
```

For large uploads, show progress and explain if the user can leave the page.

## 14. Navigation

Navigation should make location and next steps obvious.

Patterns:

```text
Top nav        small app or marketing plus app shell
Sidebar        dashboards and multi-section tools
Tabs           sibling views inside one area
Breadcrumbs    nested resource hierarchy
Stepper        ordered multi-step workflow
Command menu   quick jump, not primary structure
```

Rules:

```text
Highlight the current area.
Keep labels short and stable.
Use breadcrumbs for nested resources.
Do not use tabs for unrelated pages.
Do not hide core navigation behind hover.
Mobile navigation should preserve the main tasks.
```

Good dashboard shell:

```text
Sidebar: main sections
Header: workspace switcher, search, user menu
Content: page title, actions, body
Breadcrumb: only when hierarchy is deep
```

## 15. Toasts And Notifications

Toasts are for transient feedback, not critical information.

Good uses:

```text
Saved successfully
Copied to clipboard
Invite sent
Export started
Undo available
```

Avoid toasts for:

```text
Field validation errors
Critical errors that need action
Permanent status
Information the user must read
```

Rules:

```text
Keep toast text short.
Do not stack too many.
Provide undo for reversible destructive actions.
Keep critical errors inline too.
Do not rely on color only.
```

Example:

```text
Project archived. Undo
```

## 16. Destructive Actions

Destructive actions need proportionate friction.

Risk levels:

```text
Low        remove filter, clear search
Medium     archive item, remove member
High       delete workspace, revoke access, reset data
Critical   irreversible production/database/security action
```

Rules:

```text
Use destructive color only for destructive actions.
Explain the consequence.
Require confirmation for medium and high risk.
Require typed confirmation for high-risk irreversible actions.
Offer undo when safe and technically possible.
Log/audit important destructive actions.
```

Pattern:

```text
Normal page: Delete workspace
Dialog title: Delete workspace?
Dialog body: This permanently deletes projects, members, and billing history.
Confirmation: Type workspace name
Action: Delete workspace
Cancel: Cancel
```

Never use a generic "Are you sure?" without naming the action and object.

## 17. Detail Pages

Detail pages show one resource and its related workflows.

Anatomy:

```text
Breadcrumb
Title and status
Primary action
Metadata
Tabs or sections
Related records
Activity/audit log
Danger area if needed
```

Rules:

```text
Make the resource identity obvious.
Show status near title.
Keep primary action near title.
Put destructive actions away from routine actions.
Use tabs only for sibling sections.
Show loading/error per section when data loads separately.
```

Common sections:

```text
Overview
Settings
Members
Billing
Activity
Files
Integrations
```

## 18. Mobile And Responsive Patterns

Responsive UI is not only stacking columns.

Rules:

```text
Prioritize tasks before preserving desktop layout.
Keep primary action reachable.
Convert wide tables into cards only when comparison is not essential.
Use horizontal scroll for true data tables when needed.
Avoid tiny icon-only controls.
Keep tap targets comfortable.
Test long labels and large text.
```

Common transformations:

```text
Sidebar -> drawer or bottom nav
Toolbar -> wrapped controls or filter sheet
Table -> priority columns, cards, or horizontal scroll
Dialog -> full-screen sheet for complex forms
KPI grid -> one or two columns
```

If users need to compare many columns, mobile may need a different workflow, not a squeezed table.

## 19. Pattern Testing Checklist

For each important pattern, test:

```text
Primary happy path
Validation or blocked path
Loading state
Empty state
Error state
Keyboard path
Mobile viewport
Permission denied state
Long content
Dark mode when supported
```

Useful tools:

```text
Testing Library      component behavior
MSW                  mocked API states
Playwright           real user journeys
Storybook            component variants
axe                  accessibility smoke checks
Chromatic/screenshots visual regression
```

See [frontend-testing.md](frontend-testing.md) for the full workflow.

## 20. Practice Tasks

1. Build a settings page with profile, notification, and danger-zone sections.
2. Build a billing table with search, filters, row actions, pagination, loading, empty, and error states.
3. Build a dashboard with KPI cards, a chart, a table, a date-range filter, and a data freshness label.
4. Build a command menu with pages, projects, people, and actions.
5. Build a file upload flow with file validation, per-file progress, retry, and remove.
6. Build a delete confirmation dialog with typed confirmation.
7. Build a detail page with overview, members, activity, and settings sections.
8. Add Storybook stories for loading, empty, error, and long-content states.

## Quick Reference

```text
Form             labels, help, errors, pending, success
Settings         grouped forms, save behavior, danger zone
Dashboard        filters, KPIs, charts, table, freshness
Table            headers, sorting, filtering, actions, empty
Filters          active chips, result count, clear all, URL state
Empty state      title, reason, next action
Loading          stable layout, skeletons, pending controls
Error            plain language, recovery, preserved input
Dialog           focus, title, escape, return focus, clear actions
Command menu     search, groups, keyboard, empty state
Upload           picker, limits, progress, per-file errors
Navigation       current location, stable labels, mobile plan
Toast            short feedback, undo when useful
Destructive      consequence, confirmation, audit/undo
Detail page      identity, status, actions, related sections
```
