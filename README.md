# CoverCraft

A plain-local academic cover page builder for assignments and practical notebooks.

## Run

Open `index.html` directly in a modern browser, or serve this folder with any static web server.

## Features

- Assignment / practical notebook toggle
- Topic, course code and course title fields
- Optional submitted-by details
- Repeatable submitted-to teacher cards
- Institute name and local logo upload preview
- Live A4-style cover preview
- **Download PDF** (A4) and direct **Print** — both match the live preview exactly
- Background options: preset colours, any custom colour, or your own uploaded image (with a softness slider)
- Font choices (Times New Roman, Roboto, Arial, Georgia, Italic) and a font-size slider — plus a separate font and size control for each section (title, course, submitted by, submitted to, institute)
- Responsive layout for smaller screens

## Hosting (GitHub Pages / Netlify / etc.)

Upload the four files as-is to the repository root. The PDF download needs internet access on the visitor's device because it loads `html2canvas` and `jsPDF` from the cdnjs CDN. If that fails, **Print** → *Save as PDF* still works.
