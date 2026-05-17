const fs = require('fs');

const files = [
  'src/components/templates/BirthdayBliss/BirthdayBliss.tsx',
  'src/components/templates/BirthdayBliss/Balloon.tsx',
  'src/components/templates/BirthdayBliss/Cake.tsx',
  'src/components/templates/BirthdayBliss/Confetti.tsx'
];

const replacements = {
  'gradient-bg': 'bliss-gradient-bg',
  'gradient-soft': 'bliss-gradient-soft',
  'glass-card': 'bliss-glass-card',
  'btn-pill': 'bliss-btn-pill',
  'btn-pill-pink': 'bliss-btn-pill-pink',
  'envelope-wrap': 'bliss-envelope-wrap',
  'envelope-flap': 'bliss-envelope-flap',
  'envelope-body-front': 'bliss-envelope-body-front',
  'envelope-letter-peek': 'bliss-envelope-letter-peek',
  'letter-paper': 'bliss-letter-paper',
  ' animate-fade-in-up': ' animate-bliss-fade-in-up',
  ' animate-fade-out-up': ' animate-bliss-fade-out-up',
  ' animate-shimmer': ' animate-bliss-shimmer',
  ' animate-slide-hint': ' animate-bliss-slide-hint',
  ' animate-flame': ' animate-bliss-flame'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    content = content.split(oldClass).join(newClass);
  }
  // Special cases for envelope and stamp to avoid partial match bugs
  content = content.replace(/className="envelope/g, 'className="bliss-envelope');
  content = content.replace(/className={`envelope/g, 'className={`bliss-envelope');
  content = content.replace(/className="stamp/g, 'className="bliss-stamp');
  fs.writeFileSync(file, content);
}

console.log('Classes updated');
