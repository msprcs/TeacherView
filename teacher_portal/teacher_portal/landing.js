function navigateTo(tab) {
  // Redirect to the correct page depending on the feature card clicked
  switch (tab) {
    case 'home':
      window.location.href = 'teacher_home.html';
      break;
    case 'class':
      window.location.href = 'teacher_class.html';
      break;
    case 'record':
      window.location.href = 'teacher_classrecord.html';
      break;
    case 'announcement':
      window.location.href = 'teacher_dashboard.html#announcement';
      break;
    case 'account':
      window.location.href = 'teacher_dashboard.html#account';
      break;
    default:
      // fallback: go to dashboard
      window.location.href = 'teacher_dashboard.html';
  }
}