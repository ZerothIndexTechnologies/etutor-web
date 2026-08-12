export class Urls {
  public static readonly login = 'user/login';
  public static readonly forgotPassword = 'user/forgotPassword';
  public static readonly verifyUser = 'user/verifyUser';
  public static readonly getConfiguration = 'common/getConfiguration';
  public static readonly signup = 'user/signup';
  public static readonly becometutor = 'user/uploadTeachersDocument';
  public static readonly teacherList = 'user/getTeacherList';
  public static readonly teacherListFilter = 'user/getTeachersByFilter';
  public static readonly subjectList = 'common/getSubjectByCurriculum';
  public static readonly addClass = 'teacher/addClass';
  public static readonly classList = 'teacher/classList';
  public static readonly reserveClassList = 'teacher/reserveClass';
  public static readonly getStateByPincode = 'common/getStateByPincode';
  public static readonly citiesList = 'common/getCitiesList';
  public static readonly statesList = 'common/getStateList';
  public static readonly countryList = 'common/getCountryList';
  public static readonly languageList = 'common/getLanguageList';
  public static readonly teacherClassDetails = 'teacher/getClassDetails';
  public static readonly changePassword = 'user/changePassword';
  public static readonly deleteClass = 'teacher/deleteClass';
  public static readonly updateMettingLink = 'teacher/meetingLinkUpdate';
  public static readonly addStudentToClass = 'user/userSubscription';
  public static readonly studentProfile = 'user/studentList';
  public static readonly teacherProfile = 'user/getTeacherList';
  public static readonly notifyTeacherProfileStatus = 'common/notifyTeacherProfileStatus';
  public static readonly sendClassReminderEmail = 'teacher/sendClassReminderEmail';
}
