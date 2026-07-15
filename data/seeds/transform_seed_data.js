const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'questions.json');
console.log(`Reading ${filePath}...`);

const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

if (!data.questions || !Array.isArray(data.questions)) {
    console.error('Invalid JSON format: missing "questions" array.');
    process.exit(1);
}

// 1. Domain to Category Slug Mapping
const categoryMap = {
    'DOTNET': 'dotnet',
    'SQL': 'sql',
    'DEVOPS': 'backend',
    'FRONTEND': 'angular',
    'FULLSTACK': 'system-design',
    'CLOUD': 'backend',
    'SECURITY': 'security',
    'ARCHITECTURE': 'system-design',
    'SYSTEM_DESIGN': 'system-design'
};

const difficultyMap = {
    'Beginner': 'Easy',
    'Intermediate': 'Medium',
    'Advanced': 'Hard'
};

// 2. Group Questions by primary_slide_id
const slideGroups = {};
for (const q of data.questions) {
    if (q.primary_slide_id) {
        if (!slideGroups[q.primary_slide_id]) {
            slideGroups[q.primary_slide_id] = [];
        }
        slideGroups[q.primary_slide_id].push(q.question_id);
    }
}

let modifiedCount = 0;

// 3. Transform
for (const q of data.questions) {
    // --- Map Difficulty ---
    if (q.difficulty && difficultyMap[q.difficulty]) {
        q.difficulty = difficultyMap[q.difficulty];
    }

    // --- Map Category ---
    const domain = q.domain_id ? q.domain_id.toUpperCase() : '';
    const newCategory = categoryMap[domain] || 'fundamentals'; // fallback
    
    if (q.category === 'Core' || !q.category) {
        q.category = newCategory;
    }

    // --- Parse Legacy Title & Inject Tags ---
    const legacyMatch = q.question.match(/^Q\s+([a-zA-Z0-9_]+)\s+(.*?)\??$/);
    if (legacyMatch) {
        const prefix = legacyMatch[1].toUpperCase();
        let coreText = legacyMatch[2];

        // Title Case formatting
        coreText = coreText.toLowerCase().split(' ').map(word => {
            if (word === 'vs') return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');

        q.title = coreText;
        q.question = `${coreText}?`;

        // Tag Mapping
        const tagMap = {
            'SQL': 'SQL',
            'NG': 'Angular',
            'CSHARP': 'C#',
            'DOTNET': '.NET',
            'NODE': 'Node.js',
            'JS': 'JavaScript',
            'CSS': 'CSS',
            'HTML': 'HTML',
            'REACT': 'React',
            'VUE': 'Vue',
            'AZURE': 'Azure',
            'AWS': 'AWS',
            'GIT': 'Git',
            'DOCKER': 'Docker',
            'K8S': 'Kubernetes'
        };

        const tag = tagMap[prefix] || prefix;
        if (!q.tags) q.tags = [];
        if (!q.tags.includes(tag)) {
            q.tags.push(tag);
        }
    }

    // --- Populate Related Questions ---
    if (q.primary_slide_id && slideGroups[q.primary_slide_id]) {
        // Exclude self
        q.related_questions = slideGroups[q.primary_slide_id].filter(id => id !== q.question_id);
    }

    // --- Populate Related Concepts ---
    if (q.primary_slide_id) {
        // e.g. SLIDE_28_SAGA_PATTERN -> CONCEPT_SAGA_PATTERN
        const match = q.primary_slide_id.match(/^SLIDE_\d+_(.+)$/);
        if (match && match[1]) {
            const conceptId = `CONCEPT_${match[1]}`;
            // Add if not exists
            if (!q.related_concepts) q.related_concepts = [];
            if (!q.related_concepts.includes(conceptId)) {
                q.related_concepts.push(conceptId);
            }
        }
    }
    
    modifiedCount++;
}

// 4. Save
console.log(`Transformed ${modifiedCount} questions. Saving...`);
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done!');
