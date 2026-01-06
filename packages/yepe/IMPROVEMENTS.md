# yepe v0.2.0 Improvements Summary

## Overview
Enhanced the yepe scaffolding tool with skill selection, clean learnings templates, and improved user experience.

## Key Improvements

### 1. Skill Selection ✅
- **Before**: All skills copied from blueprint repo
- **After**: User selects which skills to include
- **Benefits**: 
  - Smaller footprint for projects that don't need all integrations
  - Clearer intent - only install what you'll use
  - Less clutter in .opencode/skill/

**UX:**
```
📦 Available skills:
   (These are specialized capabilities for external integrations)

   1. action-items
      Maintain the shared action item ledger...
   2. cloud-deploy
      Execute the cloud deployment workflow...
   ...
   
   0. None (skip all skills)
   a. All skills

Select skills (comma-separated numbers, "a" for all, "0" for none): 1,3,5
```

### 2. Clean Learnings Templates ✅
- **Before**: Copied learnings files with actual entries from blueprint repo
- **After**: Fresh template files with no entries
- **Benefits**:
  - New projects start clean
  - No confusion from blueprint repo's historical entries
  - Template documentation fully preserved

**Files templated:**
- `learnings/index.md`
- `learnings/meta-learnings.md`
- `learnings/recurring-tasks.md`
- `learnings/failures-and-resolutions.md`
- `learnings/candidate-automations.md`

### 3. Improved Prompting UX ✅

**Changes:**
- ✅ Removed cheesy "📝 Let's customize this blueprint for your project!"
- ✅ Replaced with: "Project configuration (required fields marked with *):"
- ✅ Required fields clearly marked with `*`
- ✅ Validation errors re-prompt instead of exiting
- ✅ User-friendly error messages with ❌ icon

**Before:**
```
Project name: 
Error: Project name is required
[Process exits, user has to start over]
```

**After:**
```
* Project name: 
  ❌ Project name is required

* Project name: MyApp
[Continues to next field]
```

## Technical Implementation

### Required Fields
1. **Project name** - Must be non-empty
2. **Purpose** - Must be non-empty (1-2 sentences)
3. **Beads prefix** - Must be 2-4 characters

All three use while-loops to re-prompt on validation failure.

### Optional Fields
All other fields can be skipped by pressing Enter. If skipped, templates use placeholder text like:
- `[Describe your code style preferences...]`
- `[Document your architectural decisions...]`

### Skill Filtering
- `discoverSkills()` scans `.opencode/skill/` and reads SKILL.md frontmatter
- `promptSkillSelection()` presents options and captures selection
- `processDirectory()` filters out unselected skills during staging
- Skills not selected are never copied to target repo

### Learnings Templates
- New module: `src/learnings-templates.ts`
- Contains constant strings for each template
- `copyFiles()` detects learnings/*.md and writes template instead of copying
- `getLearningsTemplate()` returns appropriate template by filename

## Files Modified

### Core
- `src/prompts.ts` - Added skill discovery, improved validation loops
- `src/learnings-templates.ts` - New module with all templates
- `src/init.ts` - Enhanced to use templates and filter skills

### Documentation
- `README.md` - Updated with required/optional field info
- `SCAFFOLD_PROMPT.md` - Updated user instructions
- `CHANGELOG.md` - Documented all changes
- `test-prompts.sh` - Added skill selection test case

### Build
- `package.json` - Version 0.2.0
- Successfully builds with `npm run build`

## Testing

Run the test script:
```bash
cd /Users/ep/workspace/agents/packages/yepe
./test-prompts.sh
```

Test validates:
- ✅ Project info prompts work
- ✅ Skill selection works (selects #1 and #3)
- ✅ Learnings files are template-only (no actual entries)
- ✅ Only selected skills are installed
- ✅ Configuration files are customized

## Usage

```bash
cd /Users/ep/workspace/agents/packages/yepe
npm run build && npm link

cd /path/to/new/repo
yepe
```

Follow the interactive prompts. Required fields will re-prompt if empty or invalid.
