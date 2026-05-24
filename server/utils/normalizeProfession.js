const professionMap = new Map([
  ['frontend', 'Frontend'],
  ['front-end', 'Frontend'],
  ['фронтенд', 'Frontend'],
  ['front end', 'Frontend'],
  ['backend', 'Backend'],
  ['back-end', 'Backend'],
  ['бэкенд', 'Backend'],
  ['back end', 'Backend'],
  ['бэкэнд', 'Backend'],
  ['fullstack', 'Fullstack'],
  ['full-stack', 'Fullstack'],
  ['фулстек', 'Fullstack'],
  ['full stack', 'Fullstack'],
  ['devops', 'DevOps'],
  ['девопс', 'DevOps'],
  ['data scientist', 'Data Scientist'],
  ['datascientist', 'Data Scientist'],
  ['дата сайентист', 'Data Scientist'],
  ['data analyst', 'Data Analyst'],
  ['dataanalyst', 'Data Analyst'],
  ['дата аналитик', 'Data Analyst'],
  ['ml engineer', 'ML Engineer'],
  ['machine learning', 'ML Engineer'],
  ['product manager', 'Product Manager'],
  ['pm', 'Product Manager'],
  ['продакт менеджер', 'Product Manager'],
  ['project manager', 'Project Manager'],
  ['проджект менеджер', 'Project Manager'],
  ['team lead', 'Team Lead'],
  ['тимлид', 'Team Lead'],
  ['designer', 'Designer'],
  ['дизайнер', 'Designer'],
  ['ux/ui', 'UX/UI Designer'],
  ['uxui', 'UX/UI Designer'],
  ['product designer', 'Product Designer'],
  ['qa', 'QA Engineer'],
  ['qa engineer', 'QA Engineer'],
  ['тестировщик', 'QA Engineer'],
  ['marketing', 'Marketer'],
  ['маркетинг', 'Marketer'],
  ['smm', 'SMM Manager'],
  ['seo', 'SEO Specialist'],
  ['analyst', 'Analyst'],
  ['business analyst', 'Business Analyst'],
  ['ba', 'Business Analyst'],
  ['system analyst', 'System Analyst'],
  ['hr', 'HR Specialist'],
  ['sales', 'Sales Manager'],
  ['support', 'Support Engineer'],
  ['student', 'Student'],
  ['студент', 'Student'],
  ['entrepreneur', 'Entrepreneur'],
  ['founder', 'Founder'],
]);

function normalizeProfession(profession) {
  if (!profession || profession.trim() === '') return null;
  const lowerProf = profession.toLowerCase().trim();
  for (const [key, value] of professionMap) {
    if (lowerProf === key || lowerProf.includes(key)) return value;
  }
  return profession.charAt(0).toUpperCase() + profession.slice(1).toLowerCase();
}

function getAllNormalizedProfessions() {
  return Array.from(new Set(professionMap.values()));
}

module.exports = { normalizeProfession, getAllNormalizedProfessions };
