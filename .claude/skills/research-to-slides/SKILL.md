---
name: research-to-slides
description: "When the user wants to research a topic and turn it into slides, a presentation, or a deck. Trigger: user mentions researching + creating slides/presentation/PPT/deck together, e.g. \"research X and make a ppt\", \"搜一下XX然后生成PPT\", \"帮我研究XX做成演示文稿\"."
---

# Research-to-Slides Skill

Turn a topic into a well-researched, structured slide deck.

## Workflow

Follow these steps in order:

### Phase 1 — Deep Research

Search the web thoroughly. Do NOT settle for the first result:

1. **Identify 3-5 angles** on the topic before searching. Write them down.
2. **Run at least 3-5 web searches** using `WebSearch`, varying keywords to cover:
   - Overview & definition
   - Key data / statistics / numbers
   - Current trends or recent developments
   - Use cases / applications
   - Pros & cons or competing perspectives
3. **Read the top 2-3 results** from each search using `WebFetch`. Extract facts, figures, quotes, and data points. Skip shallow blog-spam pages.
4. **Cross-verify** at least one key claim against a second source.

Stop and tell the user if the topic is so new or niche that fewer than 3 substantive sources can be found.

### Phase 2 — Synthesize & Structure

Organize findings into a slide deck outline before touching any tool:

1. Write a **title** (concise, under 10 words).
2. Write a **one-paragraph executive summary** (3-5 sentences covering the what, why, and key takeaway).
3. Design the **slide sequence**. A solid default for a 10-12 slide deck:

   | Slide | Type | Purpose |
   |-------|------|---------|
   | 1 | Title | Topic + subtitle + date |
   | 2 | Agenda / Outline | What we'll cover |
   | 3 | Background | Context, why this matters |
   | 4 | Key Concepts | Core ideas defined clearly |
   | 5 | Data / Stats | Numbers, charts, trends |
   | 6 | Deep Dive A | First major finding |
   | 7 | Deep Dive B | Second major finding |
   | 8 | Use Cases / Applications | Real-world examples |
   | 9 | Challenges / Trade-offs | Balanced perspective |
   | 10 | Future Outlook | What's next |
   | 11 | Summary / Takeaways | 3-5 key points |
   | 12 | References | Sources cited |

   Adjust the sequence based on the topic. For shorter decks, merge adjacent slides.

4. For each slide, draft **bullet points**:
   - 3-5 bullets per slide max
   - Each bullet should be one line (under ~15 words)
   - Include specific numbers, names, dates wherever possible
   - Mark which bullets should get data/chart visuals

### Phase 3 — Generate the PPTX

Now invoke the `pptx` skill to build the actual presentation:

1. Pass the complete outline (title, slide sequence, bullet points) to the `pptx` skill.
2. At the start ask the user: "You can choose a style: **Classic professional**, **Modern minimalist**, or **Creative bold**. Which one?"
   - If the user doesn't pick, default to **Modern minimalist**.
3. Tell the pptx skill: "Create a presentation using [CHOSEN STYLE] style with this outline: [paste outline]"
4. After the file is generated, tell the user the file path and a one-line summary of what was created.

### Quality Checklist

Before declaring the task done, verify:
- [ ] At least 5 distinct web sources were consulted
- [ ] Each slide has 3-5 bullets max (no walls of text)
- [ ] At least two specific numbers/data points are included
- [ ] Sources are listed on the final slide
- [ ] The .pptx file exists and was confirmed created

## Notes

- This skill delegates slide creation to the `pptx` skill — do NOT attempt to build slides manually.
- If web search returns sparse results, narrow the topic or tell the user honestly rather than padding with fluff.
- Use the user's language throughout (if they asked in Chinese, respond in Chinese; PPT content in the requested language).
