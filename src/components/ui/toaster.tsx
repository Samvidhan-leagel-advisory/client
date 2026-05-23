import { Slide, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './toastify-overrides.css';

export function Toaster() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={1000}
      newestOnTop
      limit={4}
      closeOnClick={false}
      draggable={false}
      pauseOnHover
      pauseOnFocusLoss
      theme="light"
      transition={Slide}
      hideProgressBar
      closeButton
      aria-label="Notifications"
    />
  );
}
