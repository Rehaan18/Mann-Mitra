import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = "en"|"hi"|"bn"|"te"|"mr"|"ta"|"gu"|"kn"|"ml"|"pa";

export interface Language {
  code: LanguageCode; name: string; nativeName: string; flag: string;
}

export const LANGUAGES: Language[] = [
  { code:"en", name:"English",   nativeName:"English",   flag:"🇬🇧" },
  { code:"hi", name:"Hindi",     nativeName:"हिन्दी",      flag:"🇮🇳" },
  { code:"bn", name:"Bengali",   nativeName:"বাংলা",       flag:"🇮🇳" },
  { code:"te", name:"Telugu",    nativeName:"తెలుగు",      flag:"🇮🇳" },
  { code:"mr", name:"Marathi",   nativeName:"मराठी",       flag:"🇮🇳" },
  { code:"ta", name:"Tamil",     nativeName:"தமிழ்",       flag:"🇮🇳" },
  { code:"gu", name:"Gujarati",  nativeName:"ગુજરાતી",     flag:"🇮🇳" },
  { code:"kn", name:"Kannada",   nativeName:"ಕನ್ನಡ",       flag:"🇮🇳" },
  { code:"ml", name:"Malayalam", nativeName:"മലയാളം",     flag:"🇮🇳" },
  { code:"pa", name:"Punjabi",   nativeName:"ਪੰਜਾਬੀ",      flag:"🇮🇳" },
];

// ─── FULL TRANSLATION MAP ───────────────────────────────────────────────────
const T: Record<LanguageCode, Record<string,string>> = {
    en: {
        appName: "Mann Mitra", tagline: "Your Mental Health Companion",
        dashboard: "Dashboard", aiSupport: "AI Support", bookSession: "Book Session",
        moodGarden: "Mood Garden", studyBuddy: "Study Buddy", resources: "Resources",
        peerSupport: "Peer Support", wellnessTools: "Wellness Tools", profile: "Profile",
        settings: "Settings", history: "History", nutritionMood: "Nutrition & Mood",
        myClients: "My Clients", appointments: "Appointments", sessionNotes: "Session Notes",
        clientProgress: "Client Progress", mySchedule: "My Schedule", campusPulse: "Campus Pulse",
        userManagement: "User Management", counsellorReview: "Counsellor Review",
        analytics: "Analytics", reports: "Reports", systemSettings: "System Settings",
        logout: "Logout", login: "Sign In", signUp: "Create Account",
        welcomeBack: "Welcome Back", yourMentalHealthCompanion: "Your Mental Health Companion",
        studentPortal: "Student Portal", counsellorPortal: "Counsellor Portal", adminPortal: "Admin Portal",
        switchToLight: "Switch to Light Mode", switchToDark: "Switch to Dark Mode",
        changeLanguage: "Change Language", selectRole: "Select Your Role",
        email: "Email", password: "Password", fullName: "Full Name",
        submit: "Submit", cancel: "Cancel", save: "Save Changes", loading: "Loading...", noData: "No data available",
        // Login
        welcomeBackMsg: "Welcome Back! 👋", signInToContinue: "Sign in to continue your wellness journey",
        joinUs: "Join us to start your wellness journey", selectRoleToLogin: "Select Your Role to Login",
        selectRoleToSignUp: "Select Your Role to Sign Up", confirmPassword: "Confirm Password",
        studentId: "Student ID", department: "Department", year: "Year",
        licenseNumber: "License Number", specialization: "Specialization", adminCode: "Administrator Code",
        processing: "Processing...", forgotPassword: "Forgot your password?",
        dontHaveAccount: "Don't have an account? Sign up", alreadyHaveAccount: "Already have an account? Sign in",
        termsText: "By continuing, you agree to Mann Mitra's Terms of Service and Privacy Policy",
        selectDepartment: "Select department", selectYear: "Select year", selectSpecialization: "Select specialization",
        enterStudentId: "Enter your student ID", enterLicenseNumber: "Enter your professional license number",
        enterAdminCode: "Enter administrator verification code",
        accountCreated: "Account created successfully! Please check your email to verify your account.",
        loginSuccess: "Login successful!",
        // Student roles
        studentDesc: "Access mental health resources, book counseling sessions, and track your wellness journey",
        counsellorDesc: "Manage appointments, provide support to students, and access professional resources",
        adminDesc: "Manage platform settings, view analytics, and oversee system operations",
        // Dashboard
        wellnessJourney: "Keep up your amazing progress on your wellness journey",
        weeklyPoints: "Weekly Points", currentStreak: "Current Streak", days: "days",
        upcomingSessions: "Upcoming Sessions", gardenLevel: "Garden Level",
        todayActivities: "Today's Wellness Activities",
        activitiesToEarnPoints: "Complete activities to earn points and grow your mood garden",
        start: "Start", done: "Done", moodJourney: "Your Mood Journey", logTodaysMood: "Log Today's Mood",
        quickActions: "Quick Actions", chatWithAI: "Chat with AI Support", bookASession: "Book a Session",
        findStudyBuddy: "Find Study Buddy", browseResources: "Browse Resources",
        upcoming: "Upcoming", wellnessScore: "Wellness Score", counselingSession: "Counseling Session",
        studyGroup: "Study Group", tomorrow: "Tomorrow", friday: "Friday",
        today: "Today", yesterday: "Yesterday", twoDaysAgo: "2 days ago",
        meditation: "10-Minute Meditation", gratitudeJournal: "Gratitude Journal",
        quickWalk: "Quick Walk", deepBreathing: "Deep Breathing", connectFriend: "Connect with Friend",
        mindfulness: "Mindfulness", exercise: "Exercise", social: "Social", points: "points",
        // WellnessTools
        wellnessToolsTitle: "Wellness Tools",
        wellnessToolsDesc: "Take care of your mental health with our assessment tools and wellness exercises.",
        stressAssessment: "Stress Assessment", breathingExercise: "Breathing Exercise", myHistory: "My History",
        stressAssessmentTitle: "Stress Assessment Questionnaire",
        stressAssessmentDesc: "Answer these questions honestly to get insights into your current stress levels. Your responses are saved privately.",
        submitAssessment: "Submit Assessment", submitting: "Submitting...", takeAgain: "Take Again",
        assessmentHistory: "Assessment History", score: "Score",
        breathingTitle: "4-7-8 Breathing Technique",
        breathingDesc: "This technique helps reduce anxiety and promotes relaxation.",
        startExercise: "Start Exercise", reset: "Reset", clickStart: "Click Start",
        inhale: "inhale", hold: "hold", exhale: "exhale",
        // BookSession
        bookSessionTitle: "Book a Session",
        bookSessionDesc: "Book a session with our qualified mental health professionals.",
        bookSessionTab: "+ Book Session", mySessionsTab: "My Sessions",
        bookYourSession: "Book Your Session", selectedCounsellor: "Selected Counsellor",
        sessionType: "Session Type", preferredDate: "Preferred Date", preferredTime: "Preferred Time",
        notes: "Notes (optional)", confirmBooking: "Confirm Booking", booking: "Booking...",
        selectCounsellor: "Select a counsellor to book your session.",
        noSessionsYet: "No sessions booked yet.",
        notesPlaceholder: "Any specific concerns you'd like to discuss...",
        onlineSession: "Online Session", inPersonSession: "In-Person Session",
        sessionBookedSuccess: "Session booked successfully! You'll receive a confirmation soon.",
        // CampusPulse
        campusPulseTitle: "Campus Pulse",
        campusPulseDesc: "Anonymous real-time insights into campus mental health trends and community mood.",
        totalResponses: "Total Responses", todaysResponses: "Today's Responses", topMood: "Top Mood",
        howAreYouFeeling: "How are you feeling right now?",
        anonymousDesc: "Your response is completely anonymous and helps us understand campus wellbeing.",
        submitAnonymously: "Submit Anonymously", thankYouSharing: "Thank you for sharing!",
        moodRecorded: "Your mood has been recorded anonymously.", submitAgain: "Submit again",
        overallMoodDist: "Overall Mood Distribution", deptMoodOverview: "Department Mood Overview",
        noDeptData: "No department data yet for this period.",
        // Profile
        profileTitle: "Profile", profileDesc: "Manage your personal information and account settings.",
        editProfile: "Edit Profile", saveChanges: "Save Changes", personalInfo: "Personal Info",
        academicProfessional: "Academic / Professional", personalInformation: "Personal Information",
        basicProfileDetails: "Your basic profile details.", fullNameLabel: "Full Name",
        emailLabel: "Email", phoneLabel: "Phone", locationLabel: "Location", bioLabel: "Bio",
        bioPlaceholder: "Tell us a little about yourself...",
        academicInfo: "Academic Information", professionalInfo: "Professional Information",
        adminAccount: "Administrator Account", fullSystemAccess: "Full system access",
        fieldsNote: "These fields were set during registration and cannot be changed.",
        assessments: "Assessments", sessions: "Sessions",
        profileUpdated: "Profile updated successfully!",
        // Common
        responses: "responses", week: "Week", month: "Month",
    },
    hi: {
        appName: "मन मित्र", tagline: "आपका मानसिक स्वास्थ्य साथी",
        dashboard: "डैशबोर्ड", aiSupport: "AI सहायता", bookSession: "सत्र बुक करें",
        moodGarden: "मूड गार्डन", studyBuddy: "अध्ययन साथी", resources: "संसाधन",
        peerSupport: "साथी सहायता", wellnessTools: "स्वास्थ्य उपकरण", profile: "प्रोफ़ाइल",
        settings: "सेटिंग्स", history: "इतिहास", nutritionMood: "पोषण और मूड",
        myClients: "मेरे क्लाइंट", appointments: "अपॉइंटमेंट", sessionNotes: "सत्र नोट्स",
        clientProgress: "क्लाइंट प्रगति", mySchedule: "मेरा शेड्यूल", campusPulse: "कैंपस पल्स",
        userManagement: "उपयोगकर्ता प्रबंधन", counsellorReview: "काउंसलर समीक्षा",
        analytics: "विश्लेषण", reports: "रिपोर्ट", systemSettings: "सिस्टम सेटिंग्स",
        logout: "लॉग आउट", login: "साइन इन", signUp: "खाता बनाएं",
        welcomeBack: "वापसी पर स्वागत", yourMentalHealthCompanion: "आपका मानसिक स्वास्थ्य साथी",
        studentPortal: "छात्र पोर्टल", counsellorPortal: "काउंसलर पोर्टल", adminPortal: "व्यवस्थापक पोर्टल",
        switchToLight: "लाइट मोड में बदलें", switchToDark: "डार्क मोड में बदलें",
        changeLanguage: "भाषा बदलें", selectRole: "अपनी भूमिका चुनें",
        email: "ईमेल", password: "पासवर्ड", fullName: "पूरा नाम",
        submit: "जमा करें", cancel: "रद्द करें", save: "बदलाव सहेजें", loading: "लोड हो रहा है...", noData: "कोई डेटा उपलब्ध नहीं",
        welcomeBackMsg: "वापसी पर स्वागत है! 👋", signInToContinue: "अपनी स्वास्थ्य यात्रा जारी रखने के लिए साइन इन करें",
        joinUs: "अपनी स्वास्थ्य यात्रा शुरू करने के लिए हमसे जुड़ें", selectRoleToLogin: "लॉगिन के लिए अपनी भूमिका चुनें",
        selectRoleToSignUp: "साइन अप के लिए अपनी भूमिका चुनें", confirmPassword: "पासवर्ड की पुष्टि करें",
        studentId: "छात्र आईडी", department: "विभाग", year: "वर्ष",
        licenseNumber: "लाइसेंस नंबर", specialization: "विशेषज्ञता", adminCode: "व्यवस्थापक कोड",
        processing: "प्रक्रिया हो रही है...", forgotPassword: "पासवर्ड भूल गए?",
        dontHaveAccount: "खाता नहीं है? साइन अप करें", alreadyHaveAccount: "पहले से खाता है? साइन इन करें",
        termsText: "जारी रखकर आप मन मित्र की सेवा शर्तों और गोपनीयता नीति से सहमत हैं",
        selectDepartment: "विभाग चुनें", selectYear: "वर्ष चुनें", selectSpecialization: "विशेषज्ञता चुनें",
        enterStudentId: "अपनी छात्र आईडी दर्ज करें", enterLicenseNumber: "अपना लाइसेंस नंबर दर्ज करें",
        enterAdminCode: "व्यवस्थापक कोड दर्ज करें",
        accountCreated: "खाता सफलतापूर्वक बनाया गया! कृपया अपना ईमेल सत्यापित करें।",
        loginSuccess: "लॉगिन सफल!",
        studentDesc: "मानसिक स्वास्थ्य संसाधनों तक पहुंचें, परामर्श सत्र बुक करें",
        counsellorDesc: "अपॉइंटमेंट प्रबंधित करें, छात्रों को सहायता प्रदान करें",
        adminDesc: "प्लेटफ़ॉर्म सेटिंग्स प्रबंधित करें, विश्लेषण देखें",
        wellnessJourney: "अपनी स्वास्थ्य यात्रा में अपनी प्रगति जारी रखें",
        weeklyPoints: "साप्ताहिक अंक", currentStreak: "वर्तमान स्ट्रीक", days: "दिन",
        upcomingSessions: "आगामी सत्र", gardenLevel: "गार्डन स्तर",
        todayActivities: "आज की स्वास्थ्य गतिविधियाँ",
        activitiesToEarnPoints: "अंक अर्जित करने के लिए गतिविधियाँ पूरी करें",
        start: "शुरू करें", done: "हो गया", moodJourney: "आपकी मूड यात्रा", logTodaysMood: "आज का मूड दर्ज करें",
        quickActions: "त्वरित क्रियाएं", chatWithAI: "AI सहायता से चैट करें", bookASession: "सत्र बुक करें",
        findStudyBuddy: "अध्ययन साथी खोजें", browseResources: "संसाधन देखें",
        upcoming: "आगामी", wellnessScore: "स्वास्थ्य स्कोर", counselingSession: "परामर्श सत्र",
        studyGroup: "अध्ययन समूह", tomorrow: "कल", friday: "शुक्रवार",
        today: "आज", yesterday: "कल", twoDaysAgo: "2 दिन पहले",
        meditation: "10 मिनट का ध्यान", gratitudeJournal: "कृतज्ञता डायरी",
        quickWalk: "त्वरित टहलना", deepBreathing: "गहरी सांस", connectFriend: "मित्र से जुड़ें",
        mindfulness: "माइंडफुलनेस", exercise: "व्यायाम", social: "सामाजिक", points: "अंक",
        wellnessToolsTitle: "स्वास्थ्य उपकरण", wellnessToolsDesc: "हमारे मूल्यांकन उपकरणों से अपना ख्याल रखें।",
        stressAssessment: "तनाव मूल्यांकन", breathingExercise: "श्वास व्यायाम", myHistory: "मेरा इतिहास",
        stressAssessmentTitle: "तनाव मूल्यांकन प्रश्नावली", stressAssessmentDesc: "अपने तनाव के बारे में जानकारी पाने के लिए ईमानदारी से उत्तर दें।",
        submitAssessment: "मूल्यांकन जमा करें", submitting: "जमा हो रहा है...", takeAgain: "फिर से लें",
        assessmentHistory: "मूल्यांकन इतिहास", score: "स्कोर",
        breathingTitle: "4-7-8 श्वास तकनीक", breathingDesc: "यह तकनीक चिंता कम करने और विश्राम बढ़ाने में मदद करती है।",
        startExercise: "व्यायाम शुरू करें", reset: "रीसेट", clickStart: "शुरू करने के लिए क्लिक करें",
        inhale: "सांस लें", hold: "रोकें", exhale: "छोड़ें",
        bookSessionTitle: "सत्र बुक करें", bookSessionDesc: "हमारे योग्य मानसिक स्वास्थ्य पेशेवरों के साथ सत्र बुक करें।",
        bookSessionTab: "+ सत्र बुक करें", mySessionsTab: "मेरे सत्र",
        bookYourSession: "अपना सत्र बुक करें", selectedCounsellor: "चुने गए काउंसलर",
        sessionType: "सत्र प्रकार", preferredDate: "पसंदीदा तारीख", preferredTime: "पसंदीदा समय",
        notes: "नोट्स (वैकल्पिक)", confirmBooking: "बुकिंग की पुष्टि करें", booking: "बुकिंग हो रही है...",
        selectCounsellor: "सत्र बुक करने के लिए काउंसलर चुनें।",
        noSessionsYet: "अभी तक कोई सत्र बुक नहीं किया गया।",
        notesPlaceholder: "आप जो चर्चा करना चाहते हैं वह यहाँ लिखें...",
        onlineSession: "ऑनलाइन सत्र", inPersonSession: "व्यक्तिगत सत्र",
        sessionBookedSuccess: "सत्र सफलतापूर्वक बुक किया गया!",
        campusPulseTitle: "कैंपस पल्स", campusPulseDesc: "कैंपस मानसिक स्वास्थ्य की वास्तविक समय जानकारी।",
        totalResponses: "कुल प्रतिक्रियाएं", todaysResponses: "आज की प्रतिक्रियाएं", topMood: "शीर्ष मूड",
        howAreYouFeeling: "आप अभी कैसा महसूस कर रहे हैं?",
        anonymousDesc: "आपकी प्रतिक्रिया पूरी तरह गुमनाम है।",
        submitAnonymously: "गुमनाम रूप से जमा करें", thankYouSharing: "साझा करने के लिए धन्यवाद!",
        moodRecorded: "आपका मूड गुमनाम रूप से दर्ज किया गया।", submitAgain: "फिर से जमा करें",
        overallMoodDist: "समग्र मूड वितरण", deptMoodOverview: "विभाग मूड अवलोकन",
        noDeptData: "इस अवधि के लिए कोई विभाग डेटा नहीं।",
        profileTitle: "प्रोफ़ाइल", profileDesc: "अपनी व्यक्तिगत जानकारी और खाता सेटिंग्स प्रबंधित करें।",
        editProfile: "प्रोफ़ाइल संपादित करें", saveChanges: "बदलाव सहेजें", personalInfo: "व्यक्तिगत जानकारी",
        academicProfessional: "शैक्षणिक / पेशेवर", personalInformation: "व्यक्तिगत जानकारी",
        basicProfileDetails: "आपकी बुनियादी प्रोफ़ाइल जानकारी।", fullNameLabel: "पूरा नाम",
        emailLabel: "ईमेल", phoneLabel: "फ़ोन", locationLabel: "स्थान", bioLabel: "परिचय",
        bioPlaceholder: "अपने बारे में थोड़ा बताएं...",
        academicInfo: "शैक्षणिक जानकारी", professionalInfo: "पेशेवर जानकारी",
        adminAccount: "व्यवस्थापक खाता", fullSystemAccess: "पूर्ण सिस्टम एक्सेस",
        fieldsNote: "ये फ़ील्ड पंजीकरण के दौरान सेट की गई थीं और बदली नहीं जा सकतीं।",
        assessments: "मूल्यांकन", sessions: "सत्र", profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
        responses: "प्रतिक्रियाएं", week: "सप्ताह", month: "महीना",
    },
    bn: {
        appName: "মন মিত্র", tagline: "আপনার মানসিক স্বাস্থ্য সঙ্গী",
        dashboard: "ড্যাশবোর্ড", aiSupport: "AI সহায়তা", bookSession: "সেশন বুক করুন",
        moodGarden: "মুড গার্ডেন", studyBuddy: "পড়াশোনার বন্ধু", resources: "সম্পদ",
        peerSupport: "সহকর্মী সহায়তা", wellnessTools: "সুস্থতার সরঞ্জাম", profile: "প্রোফাইল",
        settings: "সেটিংস", history: "ইতিহাস", nutritionMood: "পুষ্টি ও মুড",
        myClients: "আমার ক্লায়েন্ট", appointments: "অ্যাপয়েন্টমেন্ট", sessionNotes: "সেশন নোট",
        clientProgress: "ক্লায়েন্টের অগ্রগতি", mySchedule: "আমার সময়সূচী", campusPulse: "ক্যাম্পাস পালস",
        userManagement: "ব্যবহারকারী ব্যবস্থাপনা", counsellorReview: "কাউন্সেলর পর্যালোচনা",
        analytics: "বিশ্লেষণ", reports: "রিপোর্ট", systemSettings: "সিস্টেম সেটিংস",
        logout: "লগ আউট", login: "সাইন ইন", signUp: "অ্যাকাউন্ট তৈরি করুন",
        welcomeBack: "স্বাগতম", yourMentalHealthCompanion: "আপনার মানসিক স্বাস্থ্য সঙ্গী",
        studentPortal: "শিক্ষার্থী পোর্টাল", counsellorPortal: "কাউন্সেলর পোর্টাল", adminPortal: "অ্যাডমিন পোর্টাল",
        switchToLight: "লাইট মোডে পরিবর্তন করুন", switchToDark: "ডার্ক মোডে পরিবর্তন করুন",
        changeLanguage: "ভাষা পরিবর্তন করুন", selectRole: "আপনার ভূমিকা নির্বাচন করুন",
        email: "ইমেইল", password: "পাসওয়ার্ড", fullName: "পূর্ণ নাম",
        submit: "জমা দিন", cancel: "বাতিল", save: "পরিবর্তন সংরক্ষণ করুন", loading: "লোড হচ্ছে...", noData: "কোনো ডেটা নেই",
        welcomeBackMsg: "ফিরে আসার স্বাগতম! 👋", signInToContinue: "আপনার সুস্থতার যাত্রা চালিয়ে যেতে সাইন ইন করুন",
        joinUs: "আপনার সুস্থতার যাত্রা শুরু করতে আমাদের সাথে যোগ দিন", selectRoleToLogin: "লগইন করতে আপনার ভূমিকা নির্বাচন করুন",
        selectRoleToSignUp: "সাইন আপ করতে আপনার ভূমিকা নির্বাচন করুন", confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
        studentId: "শিক্ষার্থী আইডি", department: "বিভাগ", year: "বর্ষ",
        licenseNumber: "লাইসেন্স নম্বর", specialization: "বিশেষজ্ঞতা", adminCode: "অ্যাডমিন কোড",
        processing: "প্রক্রিয়া হচ্ছে...", forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
        dontHaveAccount: "অ্যাকাউন্ট নেই? সাইন আপ করুন", alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন",
        termsText: "চালিয়ে যেয়ে আপনি মন মিত্রের সেবার শর্ত এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন",
        selectDepartment: "বিভাগ নির্বাচন করুন", selectYear: "বর্ষ নির্বাচন করুন", selectSpecialization: "বিশেষজ্ঞতা নির্বাচন করুন",
        enterStudentId: "আপনার শিক্ষার্থী আইডি লিখুন", enterLicenseNumber: "আপনার লাইসেন্স নম্বর লিখুন",
        enterAdminCode: "অ্যাডমিন কোড লিখুন",
        accountCreated: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! আপনার ইমেইল যাচাই করুন।",
        loginSuccess: "লগইন সফল!",
        studentDesc: "মানসিক স্বাস্থ্য সম্পদে প্রবেশ করুন, কাউন্সেলিং সেশন বুক করুন",
        counsellorDesc: "অ্যাপয়েন্টমেন্ট পরিচালনা করুন, শিক্ষার্থীদের সহায়তা করুন",
        adminDesc: "প্ল্যাটফর্ম সেটিংস পরিচালনা করুন, বিশ্লেষণ দেখুন",
        wellnessJourney: "আপনার সুস্থতার যাত্রায় আপনার অসাধারণ অগ্রগতি চালিয়ে যান",
        weeklyPoints: "সাপ্তাহিক পয়েন্ট", currentStreak: "বর্তমান স্ট্রিক", days: "দিন",
        upcomingSessions: "আসন্ন সেশন", gardenLevel: "গার্ডেন স্তর",
        todayActivities: "আজকের সুস্থতা কার্যক্রম",
        activitiesToEarnPoints: "পয়েন্ট অর্জন করতে কার্যক্রম সম্পন্ন করুন",
        start: "শুরু করুন", done: "সম্পন্ন", moodJourney: "আপনার মুড যাত্রা", logTodaysMood: "আজকের মুড লগ করুন",
        quickActions: "দ্রুত পদক্ষেপ", chatWithAI: "AI সহায়তার সাথে চ্যাট করুন", bookASession: "সেশন বুক করুন",
        findStudyBuddy: "পড়াশোনার বন্ধু খুঁজুন", browseResources: "সম্পদ দেখুন",
        upcoming: "আসন্ন", wellnessScore: "সুস্থতার স্কোর", counselingSession: "পরামর্শ সেশন",
        studyGroup: "পড়ার দল", tomorrow: "আগামীকাল", friday: "শুক্রবার",
        today: "আজ", yesterday: "গতকাল", twoDaysAgo: "২ দিন আগে",
        meditation: "১০ মিনিটের ধ্যান", gratitudeJournal: "কৃতজ্ঞতার ডায়েরি",
        quickWalk: "দ্রুত হাঁটা", deepBreathing: "গভীর শ্বাস", connectFriend: "বন্ধুর সাথে যোগাযোগ",
        mindfulness: "মাইন্ডফুলনেস", exercise: "ব্যায়াম", social: "সামাজিক", points: "পয়েন্ট",
        wellnessToolsTitle: "সুস্থতার সরঞ্জাম", wellnessToolsDesc: "আমাদের মূল্যায়ন সরঞ্জাম দিয়ে আপনার মানসিক স্বাস্থ্যের যত্ন নিন।",
        stressAssessment: "স্ট্রেস মূল্যায়ন", breathingExercise: "শ্বাস ব্যায়াম", myHistory: "আমার ইতিহাস",
        stressAssessmentTitle: "স্ট্রেস মূল্যায়ন প্রশ্নপত্র", stressAssessmentDesc: "আপনার বর্তমান স্ট্রেস সম্পর্কে জানতে সৎভাবে উত্তর দিন।",
        submitAssessment: "মূল্যায়ন জমা দিন", submitting: "জমা হচ্ছে...", takeAgain: "আবার নিন",
        assessmentHistory: "মূল্যায়নের ইতিহাস", score: "স্কোর",
        breathingTitle: "৪-৭-৮ শ্বাস কৌশল", breathingDesc: "এই কৌশল উদ্বেগ কমাতে এবং শিথিলতা বাড়াতে সাহায্য করে।",
        startExercise: "ব্যায়াম শুরু করুন", reset: "রিসেট", clickStart: "শুরু করতে ক্লিক করুন",
        inhale: "শ্বাস নিন", hold: "ধরুন", exhale: "ছাড়ুন",
        bookSessionTitle: "সেশন বুক করুন", bookSessionDesc: "আমাদের যোগ্য মানসিক স্বাস্থ্য পেশাদারদের সাথে সেশন বুক করুন।",
        bookSessionTab: "+ সেশন বুক করুন", mySessionsTab: "আমার সেশন",
        bookYourSession: "আপনার সেশন বুক করুন", selectedCounsellor: "নির্বাচিত কাউন্সেলর",
        sessionType: "সেশনের ধরন", preferredDate: "পছন্দের তারিখ", preferredTime: "পছন্দের সময়",
        notes: "নোট (ঐচ্ছিক)", confirmBooking: "বুকিং নিশ্চিত করুন", booking: "বুকিং হচ্ছে...",
        selectCounsellor: "সেশন বুক করতে একজন কাউন্সেলর নির্বাচন করুন।",
        noSessionsYet: "এখনো কোনো সেশন বুক করা হয়নি।",
        notesPlaceholder: "আপনি যা আলোচনা করতে চান তা লিখুন...",
        onlineSession: "অনলাইন সেশন", inPersonSession: "সশরীরে সেশন",
        sessionBookedSuccess: "সেশন সফলভাবে বুক হয়েছে!",
        campusPulseTitle: "ক্যাম্পাস পালস", campusPulseDesc: "ক্যাম্পাস মানসিক স্বাস্থ্যের রিয়েল-টাইম তথ্য।",
        totalResponses: "মোট প্রতিক্রিয়া", todaysResponses: "আজকের প্রতিক্রিয়া", topMood: "শীর্ষ মুড",
        howAreYouFeeling: "আপনি এখন কেমন অনুভব করছেন?",
        anonymousDesc: "আপনার প্রতিক্রিয়া সম্পূর্ণ বেনামী।",
        submitAnonymously: "বেনামে জমা দিন", thankYouSharing: "শেয়ার করার জন্য ধন্যবাদ!",
        moodRecorded: "আপনার মুড বেনামে রেকর্ড হয়েছে।", submitAgain: "আবার জমা দিন",
        overallMoodDist: "সামগ্রিক মুড বিতরণ", deptMoodOverview: "বিভাগ মুড পর্যালোচনা",
        noDeptData: "এই সময়ের জন্য কোনো বিভাগ ডেটা নেই।",
        profileTitle: "প্রোফাইল", profileDesc: "আপনার ব্যক্তিগত তথ্য এবং অ্যাকাউন্ট সেটিংস পরিচালনা করুন।",
        editProfile: "প্রোফাইল সম্পাদনা করুন", saveChanges: "পরিবর্তন সংরক্ষণ করুন", personalInfo: "ব্যক্তিগত তথ্য",
        academicProfessional: "শিক্ষাগত / পেশাদার", personalInformation: "ব্যক্তিগত তথ্য",
        basicProfileDetails: "আপনার মূল প্রোফাইল বিবরণ।", fullNameLabel: "পূর্ণ নাম",
        emailLabel: "ইমেইল", phoneLabel: "ফোন", locationLabel: "অবস্থান", bioLabel: "পরিচিতি",
        bioPlaceholder: "নিজের সম্পর্কে একটু বলুন...",
        academicInfo: "শিক্ষাগত তথ্য", professionalInfo: "পেশাদার তথ্য",
        adminAccount: "অ্যাডমিন অ্যাকাউন্ট", fullSystemAccess: "সম্পূর্ণ সিস্টেম অ্যাক্সেস",
        fieldsNote: "এই ক্ষেত্রগুলি নিবন্ধনের সময় সেট করা হয়েছিল এবং পরিবর্তন করা যাবে না।",
        assessments: "মূল্যায়ন", sessions: "সেশন", profileUpdated: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
        responses: "প্রতিক্রিয়া", week: "সপ্তাহ", month: "মাস",
    },
    te: undefined,
    mr: undefined,
    ta: undefined,
    gu: undefined,
    kn: undefined,
    ml: undefined,
    pa: undefined
};

// For te, mr, ta, gu, kn, ml, pa — use English as base (partial translation)
// You can expand these later
const makePartial = (overrides: Partial<Record<string,string>>) => ({ ...T.en, ...overrides });

T.te = makePartial({ appName:"మన మిత్ర", tagline:"మీ మానసిక ఆరోగ్య సహచరుడు", dashboard:"డాష్‌బోర్డ్", aiSupport:"AI మద్దతు", bookSession:"సెషన్ బుక్ చేయండి", moodGarden:"మూడ్ గార్డెన్", studyBuddy:"చదువు స్నేహితుడు", resources:"వనరులు", peerSupport:"తోటి మద్దతు", wellnessTools:"ఆరోగ్య సాధనాలు", profile:"ప్రొఫైల్", settings:"సెట్టింగులు", history:"చరిత్ర", nutritionMood:"పోషణ & మూడ్", logout:"లాగ్ అవుట్", login:"సైన్ ఇన్", signUp:"ఖాతా సృష్టించండి", changeLanguage:"భాష మార్చండి", studentPortal:"విద్యార్థి పోర్టల్", counsellorPortal:"కౌన్సెలర్ పోర్టల్", adminPortal:"అడ్మిన్ పోర్టల్" });
T.mr = makePartial({ appName:"मन मित्र", tagline:"तुमचा मानसिक आरोग्य साथीदार", dashboard:"डॅशबोर्ड", aiSupport:"AI सहाय्य", bookSession:"सत्र बुक करा", moodGarden:"मूड गार्डन", studyBuddy:"अभ्यास मित्र", resources:"संसाधने", peerSupport:"समवयस्क सहाय्य", wellnessTools:"आरोग्य साधने", profile:"प्रोफाइल", settings:"सेटिंग्ज", history:"इतिहास", nutritionMood:"पोषण आणि मूड", logout:"लॉग आउट", login:"साइन इन", signUp:"खाते तयार करा", changeLanguage:"भाषा बदला", studentPortal:"विद्यार्थी पोर्टल", counsellorPortal:"समुपदेशक पोर्टल", adminPortal:"प्रशासक पोर्टल" });
T.ta = makePartial({ appName:"மன மித்ரா", tagline:"உங்கள் மனநல தோழர்", dashboard:"டாஷ்போர்டு", aiSupport:"AI ஆதரவு", bookSession:"அமர்வு பதிவு செய்க", moodGarden:"மனநிலை தோட்டம்", studyBuddy:"படிப்பு தோழர்", resources:"வளங்கள்", peerSupport:"சக ஆதரவு", wellnessTools:"நலன் கருவிகள்", profile:"சுயவிவரம்", settings:"அமைப்புகள்", history:"வரலாறு", nutritionMood:"ஊட்டச்சத்து & மனநிலை", logout:"வெளியேறு", login:"உள்நுழைக", signUp:"கணக்கு உருவாக்கு", changeLanguage:"மொழி மாற்று", studentPortal:"மாணவர் நுழைவாயில்", counsellorPortal:"ஆலோசகர் நுழைவாயில்", adminPortal:"நிர்வாக நுழைவாயில்" });
T.gu = makePartial({ appName:"મન મિત્ર", tagline:"તમારો માનસિક સ્વાસ્થ્ય સાથી", dashboard:"ડેશબોર્ડ", aiSupport:"AI સહાય", bookSession:"સત્ર બુક કરો", moodGarden:"મૂડ ગાર્ડન", studyBuddy:"અભ્યાસ સાથી", resources:"સંસાધનો", peerSupport:"સાથી સહાય", wellnessTools:"સ્વાસ્થ્ય સાધનો", profile:"પ્રોફાઇલ", settings:"સેટિંગ્સ", history:"ઇતિહાસ", nutritionMood:"પોષણ અને મૂડ", logout:"લૉગ આઉટ", login:"સાઇન ઇન", signUp:"એકાઉન્ટ બનાવો", changeLanguage:"ભાષા બદલો", studentPortal:"વિદ્યાર્થી પોર્ટલ", counsellorPortal:"કાઉન્સેલર પોર્ટલ", adminPortal:"એડમિન પોર્ટલ" });
T.kn = makePartial({ appName:"ಮನ ಮಿತ್ರ", tagline:"ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಸಂಗಾತಿ", dashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", aiSupport:"AI ಬೆಂಬಲ", bookSession:"ಸೆಷನ್ ಬುಕ್ ಮಾಡಿ", moodGarden:"ಮೂಡ್ ಗಾರ್ಡನ್", studyBuddy:"ಅಧ್ಯಯನ ಸ್ನೇಹಿತ", resources:"ಸಂಪನ್ಮೂಲಗಳು", peerSupport:"ಸಹಕರ್ಮಿ ಬೆಂಬಲ", wellnessTools:"ಆರೋಗ್ಯ ಸಾಧನಗಳು", profile:"ಪ್ರೊಫೈಲ್", settings:"ಸೆಟ್ಟಿಂಗ್‌ಗಳು", history:"ಇತಿಹಾಸ", nutritionMood:"ಪೋಷಣೆ ಮತ್ತು ಮೂಡ್", logout:"ಲಾಗ್ ಔಟ್", login:"ಸೈನ್ ಇನ್", signUp:"ಖಾತೆ ರಚಿಸಿ", changeLanguage:"ಭಾಷೆ ಬದಲಿಸಿ", studentPortal:"ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್", counsellorPortal:"ಕೌನ್ಸೆಲರ್ ಪೋರ್ಟಲ್", adminPortal:"ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್" });
T.ml = makePartial({ appName:"മന മിത്ര", tagline:"നിങ്ങളുടെ മാനസികാരോഗ്യ കൂട്ടാളി", dashboard:"ഡാഷ്‌ബോർഡ്", aiSupport:"AI പിന്തുണ", bookSession:"സെഷൻ ബുക്ക് ചെയ്യുക", moodGarden:"മൂഡ് ഗാർഡൻ", studyBuddy:"പഠന കൂട്ടുകാരൻ", resources:"വിഭവങ്ങൾ", peerSupport:"സഹകരണ പിന്തുണ", wellnessTools:"ആരോഗ്യ ഉപകരണങ്ങൾ", profile:"പ്രൊഫൈൽ", settings:"ക്രമീകരണങ്ങൾ", history:"ചരിത്രം", nutritionMood:"പോഷണവും മൂഡും", logout:"ലോഗ് ഔട്ട്", login:"സൈൻ ഇൻ", signUp:"അക്കൗണ്ട് ഉണ്ടാക്കുക", changeLanguage:"ഭാഷ മാറ്റുക", studentPortal:"വിദ്യാർഥി പോർട്ടൽ", counsellorPortal:"കൗൺസലർ പോർട്ടൽ", adminPortal:"അഡ്മിൻ പോർട്ടൽ" });
T.pa = makePartial({ appName:"ਮਨ ਮਿੱਤਰ", tagline:"ਤੁਹਾਡਾ ਮਾਨਸਿਕ ਸਿਹਤ ਸਾਥੀ", dashboard:"ਡੈਸ਼ਬੋਰਡ", aiSupport:"AI ਸਹਾਇਤਾ", bookSession:"ਸੈਸ਼ਨ ਬੁੱਕ ਕਰੋ", moodGarden:"ਮੂਡ ਗਾਰਡਨ", studyBuddy:"ਪੜ੍ਹਾਈ ਦਾ ਸਾਥੀ", resources:"ਸਰੋਤ", peerSupport:"ਸਾਥੀ ਸਹਾਇਤਾ", wellnessTools:"ਤੰਦਰੁਸਤੀ ਦੇ ਸਾਧਨ", profile:"ਪ੍ਰੋਫਾਈਲ", settings:"ਸੈਟਿੰਗਾਂ", history:"ਇਤਿਹਾਸ", nutritionMood:"ਪੋਸ਼ਣ ਅਤੇ ਮੂਡ", logout:"ਲੌਗ ਆਊਟ", login:"ਸਾਈਨ ਇਨ", signUp:"ਖਾਤਾ ਬਣਾਓ", changeLanguage:"ਭਾਸ਼ਾ ਬਦਲੋ", studentPortal:"ਵਿਦਿਆਰਥੀ ਪੋਰਟਲ", counsellorPortal:"ਕਾਉਂਸਲਰ ਪੋਰਟਲ", adminPortal:"ਐਡਮਿਨ ਪੋਰਟਲ" });

// ─── CONTEXT ────────────────────────────────────────────────────────────────
interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
  currentLanguage: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("mann-mitra-language");
    return (saved as LanguageCode) || "en";
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem("mann-mitra-language", code);
    document.documentElement.lang = code;
  };

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const t = (key: string): string =>
    T[language]?.[key] ?? T.en?.[key] ?? key;

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
