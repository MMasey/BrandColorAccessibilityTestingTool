# AI Color Generation

# Goal
Generate accessible color palettes from natural language descriptions of brand personality and style.

# Inputs
- Text prompt describing brand personality/feel
- Optional: guided prompt builder for users who need help
- Target compliance level (AA or AAA)

# Outputs
- AI-generated color palette (3-6 colors)
- Colors automatically added to contrast checker
- Suggested color names/labels

# Constraints
- Generated palettes must meet specified WCAG level
- AI must explain color choices
- Free tier (no payment required)

# Requirements
- Prompt input UI
- Guided prompt builder for beginners
- AI integration for palette generation
- Automatic compliance validation
- Color explanation/rationale display

# Dependencies
- Phase 1 (core contrast checker to validate)
- AI API integration (Anthropic Claude or OpenAI)

# Out of Scope
- No mockup generation → Feature 105 (paid)
- No logo generation
- No brand guidelines document

# Done
- User can describe brand and get accessible palette
- Generated colors pass specified WCAG level
- AI provides explanation for color choices
- Colors integrate seamlessly with contrast checker
