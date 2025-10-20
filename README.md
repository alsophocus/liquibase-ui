# Liquibase UI

A modern web-based user interface for managing Liquibase database migrations with Jenkins and Bitbucket integration.

## Features

- **Dashboard**: Overview of migration status across environments
- **Repository Management**: Integration with Bitbucket for changelog management
- **Pipeline Management**: Jenkins integration for automated deployments
- **Environment Monitoring**: Real-time status of database environments
- **Material Design 3**: Modern, responsive UI with smooth animations
- **Font Awesome Icons**: Comprehensive icon set for better UX

## Tech Stack

- **Frontend**: React 18, Material-UI 5, Vite
- **Backend**: Node.js, Express
- **Integrations**: Jenkins REST API, Bitbucket REST API
- **Design**: Material Design 3, Font Awesome

## Prerequisites

- Node.js 16+ and npm
- Jenkins server with REST API access
- Bitbucket workspace with API access
- Liquibase CLI installed (for actual migrations)

## Installation

1. **Clone and install dependencies**:
   ```bash
   cd ~/Desktop/liquibase-ui
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Jenkins and Bitbucket credentials
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1: Start backend server
   npm run start

   # Terminal 2: Start frontend development server
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001/api

## Configuration

### Jenkins Integration

1. Generate an API token in Jenkins (User → Configure → API Token)
2. Update `.env` with your Jenkins URL, username, and token
3. Ensure Jenkins has the necessary plugins for REST API access

### Bitbucket Integration

1. Create an App Password in Bitbucket (Settings → App passwords)
2. Grant repository read/write permissions
3. Update `.env` with your Bitbucket credentials and workspace

### Liquibase Setup

1. Install Liquibase CLI on your system
2. Configure database connections in your environment
3. Set up changelog files in your repositories

## API Endpoints

### Repositories
- `GET /api/repositories` - List all repositories
- `POST /api/repositories` - Add new repository

### Pipelines
- `GET /api/pipelines` - List all pipelines
- `POST /api/pipelines/:id/run` - Run pipeline
- `POST /api/pipelines/:id/stop` - Stop pipeline

### Jenkins Integration
- `GET /api/jenkins/jobs` - List Jenkins jobs
- `POST /api/jenkins/build/:jobName` - Trigger Jenkins build

### Bitbucket Integration
- `GET /api/bitbucket/repositories` - List Bitbucket repositories
- `GET /api/bitbucket/repositories/:repo/branches` - List repository branches

### Liquibase Operations
- `POST /api/liquibase/update` - Run migration
- `POST /api/liquibase/rollback` - Rollback migration
- `GET /api/liquibase/status/:environment` - Get migration status

## Project Structure

```
liquibase-ui/
├── src/
│   ├── components/          # Reusable React components
│   │   └── Layout.jsx      # Main layout with navigation
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Dashboard overview
│   │   ├── Repositories.jsx # Repository management
│   │   ├── Pipelines.jsx   # Pipeline management
│   │   ├── Environments.jsx # Environment monitoring
│   │   └── Settings.jsx    # Configuration settings
│   ├── theme.js            # Material Design 3 theme
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── server/
│   └── index.js            # Express server with API routes
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## Development

### Adding New Features

1. **Frontend Components**: Add new components in `src/components/`
2. **Pages**: Add new pages in `src/pages/` and update routing in `App.jsx`
3. **API Endpoints**: Add new routes in `server/index.js`
4. **Styling**: Follow Material Design 3 principles and use the theme system

### Customization

- **Theme**: Modify `src/theme.js` for custom colors and typography
- **Icons**: Use Font Awesome icons throughout the application
- **Animations**: CSS animations are defined in `src/index.css`

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy backend**:
   - Deploy `server/index.js` to your Node.js hosting platform
   - Set production environment variables

3. **Deploy frontend**:
   - Deploy the `dist/` folder to a static hosting service
   - Update API endpoints to point to production backend

## Security Considerations

- Store sensitive credentials in environment variables
- Use HTTPS in production
- Implement proper authentication and authorization
- Validate all API inputs
- Use secure headers and CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
