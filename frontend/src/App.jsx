import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Navbar from "./components/layout/Navbar";
import { PageLayout } from "./components/layout/PageLayout";
import { SearchBar } from "./components/SearchBar";
import { RecipeList } from "./components/RecipeList";
import { RecipeDetail } from "./components/RecipeDetail";
import { BookmarkedRecipes } from "./components/BookmarkedRecipes";
import { PantryMatcher } from "./components/PantryMatcher";
import { MealPlanner } from "./components/MealPlanner";
import { useRecipes } from "./hooks/useRecipes";

const AppContent = () => {
  const location = useLocation();
  const showNavbar = !["/login", "/register"].includes(location.pathname);

  const {
    recipes,
    selectedRecipe,
    listLoading,
    detailLoading,
    error,
    currentPage,
    setCurrentPage,
    searchForRecipes,
    selectRecipe,
    reset,
  } = useRecipes();

  const handleReset = () => {
    reset();
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f1e7]">
      {showNavbar && <Navbar onReset={handleReset} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <PageLayout>
                <SearchBar onSubmit={searchForRecipes} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    <div className="lg:col-span-5 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#1f5129]/10">
                      <RecipeList
                        recipes={recipes}
                        selectedRecipe={selectedRecipe}
                        onSelectRecipe={selectRecipe}
                        loading={listLoading}
                        error={error}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />
                    </div>
                    <div className="lg:col-span-7 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#1f5129]/10">
                      <RecipeDetail
                        recipe={selectedRecipe}
                        loading={detailLoading}
                        error={error}
                      />
                    </div>
                  </div>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarkedRecipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <PantryMatcher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlanner />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
