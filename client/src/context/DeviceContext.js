import { createContext, useContext } from 'react';

export const DeviceContext = createContext({ screenTiltStyle: {}, screenFalling: false, theme: 'default' });

export const useDeviceContext = () => useContext(DeviceContext);
