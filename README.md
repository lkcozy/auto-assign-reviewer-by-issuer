# Auto Assign Reviewer by Issuer

A GitHub Action that automatically assigns reviewers to pull requests based on the issuer using regex patterns.

## Features

- 🔍 **Regex-based matching**: Use regex patterns to match pull request issuers
- 📁 **Configurable**: Use a YAML file to define issuer-to-reviewer mappings
- 🎯 **Smart assignment**: Only assigns reviewers when patterns match
- 📊 **Outputs**: Provides useful outputs for downstream actions
- 🛡️ **Type-safe**: Written in TypeScript for better reliability

## Usage

### Basic Usage

```yaml
name: Auto Assign Reviewers
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: Auto Assign Reviewers
        uses: your-username/auto-assign-reviewer-by-issuer@v1
        with:
          token: ${{ github.token }}
          config: .github/auto-assigner.yml
```

### Advanced Usage with Outputs

```yaml
name: Auto Assign Reviewers
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: Auto Assign Reviewers
        id: assign
        uses: your-username/auto-assign-reviewer-by-issuer@v1
        with:
          token: ${{ github.token }}
          config: .github/auto-assigner.yml

      - name: Notify Reviewers
        if: steps.assign.outputs.assigned_reviewers != ''
        run: |
          echo "Reviewers assigned: ${{ steps.assign.outputs.assigned_reviewers }}"
          echo "PR issuer: ${{ steps.assign.outputs.issuer }}"
```

## Configuration

Create a `.github/auto-assigner.yml` file in your repository:

```yaml
# Assign specific reviewers based on issuer patterns
'john.*': ['alice', 'bob']
'feature/.*': ['frontend-team']
'backend.*': ['backend-team', 'devops-team']
'bugfix.*': ['qa-team', 'senior-dev']
'hotfix.*': ['senior-dev', 'devops-team']
```

### Configuration Format

- **Keys**: Regex patterns to match the pull request issuer
- **Values**: Array of GitHub usernames to assign as reviewers

## Inputs

| Name     | Description                         | Required | Default                     |
| -------- | ----------------------------------- | -------- | --------------------------- |
| `token`  | GitHub token for API access         | Yes      | `${{ github.token }}`       |
| `config` | Path to the YAML configuration file | No       | `.github/auto-assigner.yml` |

## Outputs

| Name                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `assigned_reviewers` | Comma-separated list of reviewers that were assigned |
| `issuer`             | The pull request issuer username                     |

## Development

### Prerequisites

- Node.js 20+
- Yarn

### Setup

```bash
# Install dependencies
yarn install

# Build the action
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

### Local Testing

You can test the action locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run the action locally
act pull_request
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `yarn test` and `yarn lint`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
