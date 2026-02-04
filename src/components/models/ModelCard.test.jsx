import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ModelCard from './ModelCard'

// Mock PromotedModelBadge
vi.mock('./PromotedModelBadge', () => ({
  default: ({ size }) => <div data-testid="promoted-badge" data-size={size}>PROMOTED</div>
}))

// Helper function to render with router
function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ModelCard', () => {
  const mockModel = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    birth_date: '1990-01-01',
    height: 180,
    city: 'New York',
    gender: 'male',
    profile_photo: 'https://example.com/photo.jpg',
    specializations: ['Fashion', 'Commercial', 'Editorial'],
    views_count: 1000,
    rating: 4.5,
    response_rate: 85,
    is_verified: true,
    is_premium: true,
    is_promoted: true,
    is_available: true
  }

  it('should render model basic information', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return content.includes('36') && content.includes('лет')
    })).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return content.includes('New York')
    })).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return content.includes('180') && content.includes('см')
    })).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return content.includes('Мужской')
    })).toBeInTheDocument()
  })

  it('should render model stats', () => {
    const { container } = renderWithRouter(<ModelCard model={mockModel} />)

    expect(container.textContent).toContain('1000')
    expect(container.textContent).toContain('4.5')
    expect(container.textContent).toContain('85')
  })

  it('should render specializations', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    expect(screen.getByText('Fashion')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
    expect(screen.getByText('Editorial')).toBeInTheDocument()
  })

  it('should limit specializations to 3 and show more count', () => {
    const modelWithManySpecs = {
      ...mockModel,
      specializations: ['Fashion', 'Commercial', 'Editorial', 'Runway', 'Print']
    }

    renderWithRouter(<ModelCard model={modelWithManySpecs} />)

    expect(screen.getByText('Fashion')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
    expect(screen.getByText('Editorial')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('Runway')).not.toBeInTheDocument()
    expect(screen.queryByText('Print')).not.toBeInTheDocument()
  })

  it('should render badges when applicable', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    expect(screen.getByText('PRO')).toBeInTheDocument()
    expect(screen.getByTestId('promoted-badge')).toBeInTheDocument()
    expect(screen.getByText('✅ Доступен для работы')).toBeInTheDocument()
  })

  it('should render verification badge', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    const verificationBadge = document.querySelector('.verification-badge')
    expect(verificationBadge).toBeInTheDocument()
  })

  it('should render profile image when available', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    const image = screen.getByAltText('John Doe')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('should render placeholder when no profile photo', () => {
    const modelWithoutPhoto = { ...mockModel, profile_photo: null }

    renderWithRouter(<ModelCard model={modelWithoutPhoto} />)

    const placeholder = document.querySelector('.model-card-placeholder')
    expect(placeholder).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should handle missing optional fields gracefully', () => {
    const minimalModel = {
      id: 1,
      first_name: 'Jane',
      last_name: 'Smith'
    }

    renderWithRouter(<ModelCard model={minimalModel} />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText(/🎂/)).not.toBeInTheDocument()
    expect(screen.queryByText(/📍/)).not.toBeInTheDocument()
    expect(screen.queryByText(/📏/)).not.toBeInTheDocument()
    expect(screen.queryByText(/👫/)).not.toBeInTheDocument()
  })

  it('should link to model profile', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/profile/1')
  })

  it('should handle image error', () => {
    renderWithRouter(<ModelCard model={mockModel} />)

    const image = screen.getByAltText('John Doe')
    
    // Simulate image error
    const errorEvent = new Event('error')
    image.dispatchEvent(errorEvent)

    expect(image).toHaveAttribute('src', '/api/placeholder/200/250')
  })

  it('should not show availability badge when not available', () => {
    const unavailableModel = { ...mockModel, is_available: false }

    renderWithRouter(<ModelCard model={unavailableModel} />)

    expect(screen.queryByText('✅ Доступен для работы')).not.toBeInTheDocument()
  })
})
