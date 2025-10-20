import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCodeBranch,
  faSearch,
  faPlus,
  faFolder,
  faFile,
  faClock,
  faUser,
  faEye,
  faDownload,
  faSync,
  faStar,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons'

function Repositories() {
  const theme = useTheme()
  const [repositories, setRepositories] = useState([
    {
      id: 1,
      name: 'user-service-db',
      description: 'Database migrations for user service',
      branch: 'main',
      lastCommit: '2 hours ago',
      author: 'John Doe',
      changesets: 15,
      status: 'active',
      url: 'https://bitbucket.org/company/user-service-db',
    },
    {
      id: 2,
      name: 'payment-db-migrations',
      description: 'Payment system database schema',
      branch: 'develop',
      lastCommit: '1 day ago',
      author: 'Jane Smith',
      changesets: 23,
      status: 'active',
      url: 'https://bitbucket.org/company/payment-db-migrations',
    },
    {
      id: 3,
      name: 'analytics-warehouse',
      description: 'Data warehouse schema migrations',
      branch: 'feature/new-tables',
      lastCommit: '3 days ago',
      author: 'Mike Johnson',
      changesets: 8,
      status: 'pending',
      url: 'https://bitbucket.org/company/analytics-warehouse',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    branch: 'main',
  })

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const handleAddRepository = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setNewRepo({ name: '', url: '', branch: 'main' })
  }

  const handleSaveRepository = () => {
    const newId = Math.max(...repositories.map(r => r.id)) + 1
    setRepositories([...repositories, {
      id: newId,
      ...newRepo,
      description: 'New repository',
      lastCommit: 'Just now',
      author: 'Current User',
      changesets: 0,
      status: 'active',
    }])
    handleCloseDialog()
  }

  const RepositoryCard = ({ repo }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        }
      }}
      className="scale-in"
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
              <FontAwesomeIcon icon={faCodeBranch} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {repo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {repo.description}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={repo.status}
            color={getStatusColor(repo.status)}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faCodeBranch} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {repo.branch}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faFile} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {repo.changesets} changesets
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faUser} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {repo.author}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faClock} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {repo.lastCommit}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faEye} />}
            sx={{ flex: 1 }}
          >
            View
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faSync} />}
            sx={{ flex: 1 }}
          >
            Sync
          </Button>
          <Tooltip title="Open in Bitbucket">
            <IconButton 
              size="small"
              onClick={() => window.open(repo.url, '_blank')}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Repositories
        </Typography>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={handleAddRepository}
          sx={{ borderRadius: 3 }}
        >
          Add Repository
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredRepositories.map((repo) => (
          <Grid item xs={12} md={6} lg={4} key={repo.id}>
            <RepositoryCard repo={repo} />
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Repository</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Repository Name"
              fullWidth
              value={newRepo.name}
              onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
            />
            <TextField
              label="Bitbucket URL"
              fullWidth
              value={newRepo.url}
              onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
              placeholder="https://bitbucket.org/workspace/repository"
            />
            <FormControl fullWidth>
              <InputLabel>Default Branch</InputLabel>
              <Select
                value={newRepo.branch}
                label="Default Branch"
                onChange={(e) => setNewRepo({ ...newRepo, branch: e.target.value })}
              >
                <MenuItem value="main">main</MenuItem>
                <MenuItem value="master">master</MenuItem>
                <MenuItem value="develop">develop</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveRepository}
            variant="contained"
            disabled={!newRepo.name || !newRepo.url}
          >
            Add Repository
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Repositories
