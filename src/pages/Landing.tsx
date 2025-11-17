import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, Typography, Grid, Card, CardContent } from '@mui/material'
import {
  ElectricCar,
  Groups,
  Savings,
  Schedule,
  EmojiEvents,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <ElectricCar sx={{ fontSize: 48 }} />,
      title: 'Shared Electric Vehicles',
      description: 'Access a fleet of modern electric vehicles without the burden of full ownership',
    },
    {
      icon: <Groups sx={{ fontSize: 48 }} />,
      title: 'Co-Ownership Groups',
      description: 'Join or create groups to share costs and responsibilities with trusted members',
    },
    {
      icon: <Savings sx={{ fontSize: 48 }} />,
      title: 'Cost Efficient',
      description: 'Split maintenance, insurance, and charging costs among group members',
    },
    {
      icon: <Schedule sx={{ fontSize: 48 }} />,
      title: 'Smart Booking',
      description: 'AI-powered scheduling ensures fair access and optimal vehicle utilization',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up and verify your email to get started',
    },
    {
      number: '02',
      title: 'Join a Group',
      description: 'Browse available groups or create your own',
    },
    {
      number: '03',
      title: 'Book Your Ride',
      description: 'Reserve a vehicle when you need it',
    },
    {
      number: '04',
      title: 'Drive & Share',
      description: 'Enjoy your journey and contribute to sustainability',
    },
  ]

  const benefits = [
    'Lower ownership costs',
    'Environmental sustainability',
    'Flexible vehicle access',
    'Community support',
    'No maintenance hassles',
    'Smart cost tracking',
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Group Owner',
      text: 'Co-Hire Share made it possible for our family to afford an electric vehicle. The cost-sharing model is brilliant!',
    },
    {
      name: 'Michael Chen',
      role: 'Active Member',
      text: 'I love the convenience of having access to an EV without the full cost of ownership. The booking system is seamless.',
    },
    {
      name: 'Emma Williams',
      role: 'Daily Commuter',
      text: 'The AI scheduling is fair and transparent. I always get my vehicle when I need it for my commute.',
    },
  ]

  return (
    <Box sx={{ backgroundColor: 'var(--neutral-50)', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: 'var(--neutral-100)',
          borderBottom: '1px solid var(--neutral-200)',
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'var(--font-display)',
                color: 'var(--neutral-800)',
                fontWeight: 700,
              }}
            >
              Co-Hire Share EV
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'var(--neutral-300)',
                  color: 'var(--neutral-700)',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'var(--neutral-400)',
                    backgroundColor: 'var(--neutral-100)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                className="btn-primary"
                sx={{ textTransform: 'none' }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%)',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--neutral-800)',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Drive Electric.
                <br />
                Share Costs.
                <br />
                <Box component="span" sx={{ color: 'var(--accent-blue)' }}>
                  Build Community.
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'var(--neutral-600)',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Experience the future of sustainable transportation through co-ownership.
                Share electric vehicles, split costs, and reduce your carbon footprint.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  className="btn-primary"
                  sx={{
                    height: '56px',
                    px: 4,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    height: '56px',
                    px: 4,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderColor: 'var(--accent-blue)',
                    color: 'var(--accent-blue)',
                    '&:hover': {
                      borderColor: '#6a8a9f',
                      backgroundColor: 'rgba(122, 154, 175, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: 'var(--neutral-100)',
                  borderRadius: 'var(--radius-xl)',
                  p: 4,
                  boxShadow: '0 8px 32px rgba(45, 37, 32, 0.12)',
                  border: '1px solid var(--neutral-200)',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '400px',
                    backgroundColor: 'var(--neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <ElectricCar
                    sx={{
                      fontSize: 200,
                      color: 'var(--accent-blue)',
                      opacity: 0.5,
                    }}
                  />
                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      right: 16,
                      textAlign: 'center',
                      color: 'var(--neutral-600)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Your high-quality EV photo here
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'var(--neutral-50)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'var(--font-display)',
                color: 'var(--neutral-800)',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Why Co-Hire Share?
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: 'var(--neutral-600)', maxWidth: '600px', mx: 'auto' }}
            >
              Everything you need for a seamless shared EV experience
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className="card"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        color: 'var(--neutral-700)',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--neutral-800)',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--neutral-600)' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: 'var(--neutral-100)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'var(--font-display)',
                color: 'var(--neutral-800)',
                fontWeight: 700,
                mb: 2,
              }}
            >
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: 'var(--neutral-600)' }}>
              Get started in four simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 700,
                      color: 'var(--accent-blue)',
                      opacity: 0.2,
                      mb: -2,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--neutral-800)',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--neutral-600)' }}>
                    {step.description}
                  </Typography>
                  {index < steps.length - 1 && (
                    <ArrowForward
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        right: -24,
                        top: 40,
                        color: 'var(--neutral-300)',
                        fontSize: 32,
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Comparison */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'var(--neutral-50)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--neutral-800)',
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Benefits You'll Love
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'var(--neutral-600)', mb: 3, lineHeight: 1.8 }}
              >
                Co-ownership isn't just about sharing costs—it's about creating a
                sustainable, community-driven approach to transportation.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {benefits.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle sx={{ color: 'var(--accent-green)', fontSize: 28 }} />
                    <Typography
                      variant="body1"
                      sx={{ color: 'var(--neutral-700)', fontWeight: 500 }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: 'var(--accent-blue)',
                  borderRadius: 'var(--radius-xl)',
                  p: 4,
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(122, 154, 175, 0.3)',
                }}
              >
                <EmojiEvents sx={{ fontSize: 64, mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Save up to 60%
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Compared to traditional vehicle ownership, co-ownership can reduce your
                  transportation costs by more than half while giving you access to
                  premium electric vehicles.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'var(--accent-blue)',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': {
                      backgroundColor: 'var(--neutral-100)',
                    },
                  }}
                >
                  Calculate Your Savings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: 'var(--neutral-100)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'var(--font-display)',
                color: 'var(--neutral-800)',
                fontWeight: 700,
                mb: 2,
              }}
            >
              What Our Members Say
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  className="card"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'var(--neutral-700)',
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.8,
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: 'var(--neutral-800)',
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--neutral-600)' }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: 'var(--neutral-50)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'var(--font-display)',
              color: 'var(--neutral-800)',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'var(--neutral-600)', mb: 4 }}
          >
            Join thousands of members already enjoying the benefits of shared EV ownership
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              className="btn-primary"
              sx={{
                height: '56px',
                px: 4,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Create Free Account
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                height: '56px',
                px: 4,
                textTransform: 'none',
                fontSize: '1.1rem',
                borderColor: 'var(--accent-blue)',
                color: 'var(--accent-blue)',
                '&:hover': {
                  borderColor: '#6a8a9f',
                  backgroundColor: 'rgba(122, 154, 175, 0.1)',
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: 'var(--neutral-800)',
          color: 'var(--neutral-200)',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  mb: 2,
                  color: 'white',
                }}
              >
                Co-Hire Share EV
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                Making electric vehicle ownership accessible through community-driven
                co-ownership.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: 'white' }}
              >
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Features
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Pricing
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  How it works
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: 'white' }}
              >
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Careers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: 'white' }}
              >
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Help Center
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  FAQ
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Community
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: 'white' }}
              >
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Privacy
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Terms
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Security
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: '1px solid var(--neutral-600)',
              mt: 4,
              pt: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">
              © 2025 Co-Hire Share EV. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing
