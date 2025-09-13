import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/layout';
import WelcomeScreen from '../components/WelcomeScreen/welcomeScreen';
import GenerateQuiz from '../components/GenerateQuiz/generateQuiz';
import TakeQuiz from '../components/TakeQuiz/takeQuiz';
import QuizResults from '../components/QuizResults/quizResults';
import ErrorElement from '../components/Global/errorElement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <WelcomeScreen />,
      },
      {
        path: 'generate-quiz',
        element: <GenerateQuiz />,
      },
      {
        path: 'take-quiz',
        element: <TakeQuiz />,
      },
      {
        path: 'quiz-results',
        element: <QuizResults />,
      },
      {
        path: '*',
        element: <WelcomeScreen />, // Fallback to welcome screen for unknown routes
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
