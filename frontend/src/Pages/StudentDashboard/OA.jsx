import React from 'react';
import StudentDashboards from '../../components/StudentDashboard/sdashboard';
import Header from '../../components/header';
import Footer from '../../components/footer';
import OnlineAssessment from '../../components/StudentDashboard/oa';

const OA = () => {
  return (
    <>
      <Header />
      <StudentDashboards />
      <OnlineAssessment />
      <Footer />
    </>
  );
};

export default OA;

git pull origin main
git add .
git commit -m "sdashboard changes"
git push origin main


