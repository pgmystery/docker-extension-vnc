# Workstation Docker Images

This directory contains Dockerfiles for various development workstations based on the Ubuntu XFCE VNC image.

## Workstation Types

- **Base**: Common tools, VS Code, Google Chrome, network tools.
- **Node.js**: Node 20 LTS, npm, pnpm, yarn, TypeScript.
- **Python**: Python 3, poetry, uv, JupyterLab.
- **AI / ML**: Python workstation + PyTorch (CPU), Transformers, Data Science libraries.
- **Fullstack**: Node.js, Python, DB Clients (Postgres, Redis, Mongo), Docker CLI.
- **Java**: OpenJDK 21, Maven, Gradle.
- **Go**: Go toolchain.
- **Rust**: rustup, cargo.
- **DevOps**: Docker CLI, Terraform, Ansible, kubectl, AWS CLI, Azure CLI, Helm.

## Building

You can build all workstations using the provided Makefile:

```bash
make all
```

Or build individual workstations:

```bash
make base
make node
# ... etc
```

Images are tagged as `pgmystery/workstation-<type>:latest`.
