# CSS Extraction

## Change Summary

**Date:** Current date
**Type:** Code organization / Refactoring
**Files Affected:** 
- `index.html` (modified)
- `style.css` (created)

## Description

The CSS styles were moved from an inline `<style>` tag in `index.html` to a separate external stylesheet file named `style.css`. This change follows web development best practices of separating concerns (HTML structure, CSS styling, and JavaScript functionality).

## Technical Details

1. A new file `style.css` was created containing all CSS rules previously defined in the `<style>` tag
2. The entire `<style>` section was removed from `index.html`
3. A `<link>` tag was added to the `<head>` section of `index.html` to reference the external stylesheet:
   ```html
   <link rel="stylesheet" href="style.css">
   ```

## Benefits

1. **Improved readability:** The HTML file is now much shorter and more focused on structure
2. **Better caching:** Browsers can cache the CSS file separately from the HTML
3. **Easier maintenance:** Styles can be modified without touching the HTML
4. **Parallel loading:** Browser can download HTML and CSS in parallel
5. **Consistency:** Follows standard web development practices

## Notes

- No functional changes were made to the actual CSS rules
- The UI appearance and behavior remain exactly the same
- Future CSS modifications should be made to the `style.css` file, not inline in the HTML 