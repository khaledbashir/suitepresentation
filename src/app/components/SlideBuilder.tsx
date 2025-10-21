import { useState } from 'react';

interface SlideBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
}

const SlideBuilder = ({ isOpen, onClose, selectedText }: SlideBuilderProps) => {
  const [slides, setSlides] = useState<string[]>([
    'Welcome to Your Presentation',
    'Generated from AI',
    'Click to edit slides'
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const generatePresentation = () => {
    // TODO: Connect to AI to generate slides
    const demoSlides = [
      `# ${selectedText || 'Your Topic'}\n\nAI-Generated Presentation`,
      '## Key Points\n\n- Professional slides\n- Easy to edit\n- Beautiful themes',
      '## Features\n\n- Drag & drop\n- Custom themes\n- Export options',
      '## Conclusion\n\nReady to present!'
    ];
    setSlides(demoSlides);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className={`slide-builder-panel ${isOpen ? 'open' : ''}`}>
      <div className="slide-builder-header">
        <div className="slide-builder-title">
          <span>Slide Builder</span>
        </div>
        <div className="slide-builder-actions">
          <button 
            className="slide-builder-btn"
            onClick={() => setIsPresenting(!isPresenting)}
          >
            {isPresenting ? 'Edit' : 'Preview'}
          </button>
          <button className="slide-builder-close" onClick={onClose}>×</button>
        </div>
      </div>

      {!isPresenting ? (
        <div className="slide-builder-editor">
          <div className="slide-builder-sidebar">
            <div className="slides-header">
              <span>Slides ({slides.length})</span>
              <button 
                className="generate-btn"
                onClick={generatePresentation}
              >
                Generate
              </button>
            </div>
            <div className="slides-list">
              {slides.map((slide, idx) => (
                <div 
                  key={idx}
                  className={`slide-thumb ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                >
                  <div className="slide-number">{idx + 1}</div>
                  <div className="slide-preview">
                    {slide.substring(0, 30)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="slide-builder-canvas">
            <div className="canvas-header">
              <div className="slide-nav">
                <button onClick={prevSlide} disabled={currentSlide === 0}>←</button>
                <span>Slide {currentSlide + 1} of {slides.length}</span>
                <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>→</button>
              </div>
            </div>
            <div className="slide-content">
              <textarea
                value={slides[currentSlide]}
                onChange={(e) => {
                  const newSlides = [...slides];
                  newSlides[currentSlide] = e.target.value;
                  setSlides(newSlides);
                }}
                className="slide-editor"
                placeholder="Edit your slide content..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="presentation-mode">
          <div className="present-slide">
            <div className="present-content">
              {slides[currentSlide].split('\n').map((line, idx) => (
                <p key={idx} className={line.startsWith('#') ? 'heading' : ''}>
                  {line.replace(/^#+\s*/, '')}
                </p>
              ))}
            </div>
          </div>
          <div className="present-controls">
            <button onClick={prevSlide} disabled={currentSlide === 0}>← Previous</button>
            <span>{currentSlide + 1} / {slides.length}</span>
            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideBuilder;
