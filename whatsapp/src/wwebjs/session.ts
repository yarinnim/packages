/* eslint-disable no-console */
import fs from 'fs';

type SessionProps = {
  id: string,
  lastActivity: Date,
  state: {
    isReady: boolean,
    exists: boolean,
    authenticated: boolean,
  }
};

const getDefaultState = (sessionId: number|string, props: any = {}) => {
  const { state = {} } = props;
  const session = {
    id: sessionId,
    lastActivity: new Date().getTime(),
    timer: null,
    state: {
      isReady: false,
      exists: false,
      authenticated: false,
      ...state,
    },
  };

  return {
    setState: (key: string, value: boolean) => {
      session.state[key] = value;
      return session;
    },

    setStates: (pState: any) => {
      const { state } = session;
      session.state = { ...state, ...pState };
      return session;
    },

    resetState: () => {
      session.state = {
        isReady: false,
        exists: false,
        authenticated: false,
      };
      return session;
    },

    getState: (key: string = '') => {
      if (key === '') return session.state;
      return session.state[key];
    },

    isReady: () => session.state.authenticated && session.state.isReady,

    save: (sessionId: any) => {
      session.id = sessionId;
      session.lastActivity = new Date().getTime();
      return session;
    },

  };
};

const getSessionDir = (props: any) => {
  const { dataPath, sessionId } = props;
  const sessionName = `session-${sessionId}`;
  const sessionDir = `${dataPath}/${sessionName}`;
  return [sessionDir, sessionName];
};

const sessionExists = (props: any) => {
  const { dataPath, session } = props;
  const [sessionDir, sessionName] = getSessionDir({ dataPath, sessionId: session.id });

  if (!fs.existsSync(sessionDir)) return false;

  const files = fs.readdirSync(dataPath);
  const exists = files.some((file: any) => (file.startsWith(sessionName)
    || file.includes('Default')
    || file.includes('session')));

  if (!exists) return false;

  const existsMsg = `[INFO] WhatsApp-${session.id} - Using existing session to authenticate.`;
  console.log(existsMsg);
  session.setState('exists', true); 
  return session.getState('exists');
};

const validateSession = (props: any) => {
  const { session } = props;
  const exists = sessionExists(props);
  if (!exists) return false;
  session.timer = setTimeout(() => {
    const isReady = session.isReady();
    if (!isReady) session.resetState();
    clearTimeout(session.timer);
  }, 5000);
};

const destroy = (props: any) => {
  const { dataPath, sessionId } = props;
  const [sessionDir] = getSessionDir({ dataPath, sessionId });
  const exists = fs.existsSync(sessionDir);
  if (!exists) return Promise.resolve({ sessionDir });
  fs.rmSync(sessionDir, { recursive: true, force: true });
  return Promise.resolve({ sessionDir });
};

export default function initSession(sessionId: string|number, props: any): any {
  const session = getDefaultState(sessionId);
  const bindedProps = { ...props, session };
  return {
    id: sessionId,
    exists: sessionExists.bind(null, bindedProps),
    validate: validateSession.bind(null, bindedProps),
    getState: session.getState,
    setState: session.setState,
    setStates: session.setStates,
    save: session.save,

    destroy: destroy.bind(null, { ...bindedProps, sessionId }),
  };
}
