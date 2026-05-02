import Chatbot from './components/Chatbot'

function App() {
  return (
    // Essa div fixa o chatbot no canto inferior direito e limita a largura dele
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      width: '350px',
      zIndex: 1000 
    }}>
      <Chatbot />
    </div>
  )
}

export default App