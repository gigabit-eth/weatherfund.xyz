import './globals.css';

export const metadata = {
  title: 'WeatherFund — Read the Sky. Fund the Future.',
  description: 'Weather intelligence meets financial opportunity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
