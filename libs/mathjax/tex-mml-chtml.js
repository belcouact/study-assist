/* Minimal MathJax Simulation */
window.MathJax = window.MathJax || {};

// Simple math rendering function to provide basic functionality
MathJax.typeset = function(elements) {
  if (!elements || !elements.length) return;
  
  console.log('Local MathJax fallback attempting to render math');
  
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (!element) continue;
    
    // Find all math expressions in the element
    var text = element.innerHTML;
    
    // Replace inline math with simple styling
    text = text.replace(/\$(.*?)\$/g, '<span class="math-inline" style="font-style: italic; font-family: serif;">$1</span>');
    
    // Replace display math with more prominent styling
    text = text.replace(/\$\$(.*?)\$\$/g, 
      '<div class="math-display" style="text-align:center; margin: 1em 0; font-family: serif; font-size: 1.2em;">$1</div>'
    );
    
    element.innerHTML = text;
  }
};

// Provide a promise interface for typesetting
MathJax.typesetPromise = function(elements) {
  return new Promise(function(resolve, reject) {
    try {
      MathJax.typeset(elements);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

// Provide hub for backward compatibility
MathJax.Hub = {
  Queue: function(callback) {
    if (typeof callback === 'function') {
      setTimeout(callback, 0);
    }
  },
  Typeset: function(element, callback) {
    MathJax.typeset([element]);
    if (typeof callback === 'function') {
      setTimeout(callback, 0);
    }
  }
};

console.log('Local MathJax loaded as fallback'); 