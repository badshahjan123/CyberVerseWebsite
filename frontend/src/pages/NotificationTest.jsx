import NotificationTester from "../components/NotificationTester";

const NotificationTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Notification System Test
          </h1>
          <p className="text-slate-300">
            Test the real-time notification system functionality
          </p>
        </div>

        <NotificationTester />
      </div>
    </div>
  );
};

export default NotificationTest;
