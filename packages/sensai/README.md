# Sensai

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/sensai">
    <img alt="" src="https://img.shields.io/npm/v/sensai.svg?style=for-the-badge&labelColor=3d3d3d">
  </a> 
  <a aria-label="Join the community" href="https://github.com/sensaihq/sensai/discussions">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20community-f62681.svg?style=for-the-badge&labelColor=000000&logoWidth=20">
  </a>
</p>

Sensai is opiniated TypeScript/JavaScript framework for building powerful AI agents and APIs using nothing more than a file-based structure. Define prompts, wire up tools and even orchestrate multi-agent systems using simple file conventions. Sensai gives you all the primitives you need so you can focus on building.

- [**No code AI agents**](https://sensai.sh/docs/agent/prompt)
- [**Multi-agents orchestration**](https://sensai.sh/docs/multi-agent/orchestrator)
- [**API battery included**](https://www.sensai.sh/docs/building)
- **File-system based router**
- **Zero configuration**
- **Live reload and automatic bundling**
- and more
<!-- - and [more](https://sensai.sh/docs#features) -->

## Getting Started

Visit [https://sensai.sh/docs](https://sensai.sh/docs) to get started and view the full documentation.

Dont' feel like reading documentation? You're just one command away from creating your first API.

```sh
npm create sensai
```

Happy coding!

## Need a little taste?

With Sensai’s file-based routing, this simple folder structure defines a fully functional and complex multi-agent system with absolutely no config, no boilerplate or even code.

```
api/
├─ orchestrator.md
├─ researcher/
│  ├─ orchestator.md
│  └─ creative/
│     ├─ prompt.md
│  └─ pragmatic/
│     ├─ prompt.md
└─ reviewer/
   └─ prompt.md
```
