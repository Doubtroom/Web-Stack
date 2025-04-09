import React from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useSelector } from 'react-redux';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [transformComponent, setTransformComponent] = React.useState(null);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    if (transformComponent) {
      transformComponent.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (transformComponent) {
      transformComponent.zoomOut();
    }
  };

  const handleReset = () => {
    if (transformComponent) {
      transformComponent.resetTransform();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Controls */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-2 rounded-full bg-white/10 backdrop-blur-sm z-20">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 rounded-full hover:bg-white/20 transition-colors text-white text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Image container with react-zoom-pan-pinch */}
            <div className="w-full h-full flex items-center justify-center cursor-grab">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                centerOnInit={true}
                ref={setTransformComponent}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <TransformComponent
                    wrapperClass="w-full h-full flex items-center justify-center"
                    contentClass="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={imageUrl}
                      alt="Zoomed"
                      className="max-w-full max-h-full object-contain"
                    />
                  </TransformComponent>
                )}
              </TransformWrapper>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal; 