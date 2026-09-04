import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppProvider } from '@/context/AppContext'
import { AboutPage } from '@/pages/About'
import { AddServicePage, EditServicePage, SubmitFacilityPage } from '@/pages/AddService'
import { AdminFacilitiesPage } from '@/pages/AdminFacilities'
import { ExplorePage } from '@/pages/Explore'
import { FavouritesPage } from '@/pages/Favourites'
import { HomePage } from '@/pages/Home'
import { MapPage } from '@/pages/MapPage'
import { OnboardingGuard } from '@/pages/Onboarding'
import {
  ProfilePage,
  SubmittedReportsPage,
} from '@/pages/Profile'
import { ServiceDetailsPage } from '@/pages/ServiceDetails'
import { SupportDetailPage } from '@/pages/SupportDetail'
import { SupportPage } from '@/pages/Support'

function EditServiceRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/add-service/edit/${id}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <OnboardingGuard>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="favourites" element={<FavouritesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="submitted-reports" element={<SubmittedReportsPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="support/:id" element={<SupportDetailPage />} />
              <Route path="service/:id" element={<ServiceDetailsPage />} />
              <Route path="list-facility" element={<SubmitFacilityPage />} />
              <Route path="add-service/new" element={<AdminRoute><AddServicePage /></AdminRoute>} />
              <Route path="add-service/edit/:id" element={<AdminRoute><EditServicePage /></AdminRoute>} />
              <Route path="add-service" element={<AdminRoute><AdminFacilitiesPage /></AdminRoute>} />
              <Route path="edit-service/:id" element={<EditServiceRedirect />} />
              <Route path="my-submissions" element={<Navigate to="/add-service" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OnboardingGuard>
      </AppProvider>
    </BrowserRouter>
  )
}
