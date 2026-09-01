import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppProvider } from '@/context/AppContext'
import { AddServicePage, EditServicePage } from '@/pages/AddService'
import { ExplorePage } from '@/pages/Explore'
import { FavouritesPage } from '@/pages/Favourites'
import { HomePage } from '@/pages/Home'
import { MapPage } from '@/pages/MapPage'
import { OnboardingGuard } from '@/pages/Onboarding'
import {
  MySubmissionsPage,
  ProfilePage,
  SubmittedReportsPage,
} from '@/pages/Profile'
import { ServiceDetailsPage } from '@/pages/ServiceDetails'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <OnboardingGuard>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="favourites" element={<FavouritesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="my-submissions" element={<MySubmissionsPage />} />
              <Route path="submitted-reports" element={<SubmittedReportsPage />} />
              <Route path="service/:id" element={<ServiceDetailsPage />} />
              <Route path="add-service" element={<AddServicePage />} />
              <Route path="edit-service/:id" element={<EditServicePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OnboardingGuard>
      </AppProvider>
    </BrowserRouter>
  )
}
