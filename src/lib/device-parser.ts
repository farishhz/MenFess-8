// Helper functions to parse user-agent and get accurate device info

export interface DeviceInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  deviceType: "Mobile" | "Tablet" | "Desktop"
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  if (!userAgent || userAgent === "unknown") {
    return {
      browser: "Unknown",
      browserVersion: "",
      os: "Unknown",
      osVersion: "",
      device: "Unknown",
      deviceType: "Desktop"
    }
  }

  // Browser detection
  let browser = "Unknown"
  let browserVersion = ""
  
  if (userAgent.includes("Edg/")) {
    browser = "Microsoft Edge"
    browserVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || ""
  } else if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
    browser = "Google Chrome"
    browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || ""
  } else if (userAgent.includes("Firefox/")) {
    browser = "Mozilla Firefox"
    browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || ""
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) {
    browser = "Safari"
    browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || ""
  } else if (userAgent.includes("Opera/") || userAgent.includes("OPR/")) {
    browser = "Opera"
    browserVersion = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || ""
  }

  // OS detection
  let os = "Unknown"
  let osVersion = ""
  
  if (userAgent.includes("Windows NT")) {
    os = "Windows"
    const version = userAgent.match(/Windows NT ([\d.]+)/)?.[1]
    if (version === "10.0") osVersion = "10/11"
    else if (version === "6.3") osVersion = "8.1"
    else if (version === "6.2") osVersion = "8"
    else if (version === "6.1") osVersion = "7"
    else osVersion = version || ""
  } else if (userAgent.includes("Mac OS X")) {
    os = "macOS"
    osVersion = userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || ""
  } else if (userAgent.includes("Android")) {
    os = "Android"
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || ""
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = userAgent.includes("iPad") ? "iPadOS" : "iOS"
    osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") || ""
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
  }

  // Device type detection
  let deviceType: "Mobile" | "Tablet" | "Desktop" = "Desktop"
  let device = "Unknown"
  
  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    deviceType = "Mobile"
    
    // Try to detect specific mobile device
    if (userAgent.includes("iPhone")) {
      device = "iPhone"
    } else if (userAgent.includes("Samsung")) {
      device = "Samsung"
    } else if (userAgent.includes("Xiaomi")) {
      device = "Xiaomi"
    } else if (userAgent.includes("OPPO")) {
      device = "OPPO"
    } else if (userAgent.includes("Vivo")) {
      device = "Vivo"
    } else if (userAgent.includes("Huawei")) {
      device = "Huawei"
    } else {
      device = "Mobile Device"
    }
  } else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
    deviceType = "Tablet"
    device = userAgent.includes("iPad") ? "iPad" : "Tablet"
  } else {
    deviceType = "Desktop"
    device = "Desktop Computer"
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceType
  }
}

export function formatDeviceInfo(deviceInfo: DeviceInfo): string {
  const parts: string[] = []
  
  // Device type and name
  parts.push(`${deviceInfo.deviceType}: ${deviceInfo.device}`)
  
  // Browser
  if (deviceInfo.browser !== "Unknown") {
    const browserStr = deviceInfo.browserVersion 
      ? `${deviceInfo.browser} ${deviceInfo.browserVersion.split('.')[0]}`
      : deviceInfo.browser
    parts.push(browserStr)
  }
  
  // OS
  if (deviceInfo.os !== "Unknown") {
    const osStr = deviceInfo.osVersion 
      ? `${deviceInfo.os} ${deviceInfo.osVersion}`
      : deviceInfo.os
    parts.push(osStr)
  }
  
  return parts.join(" • ")
}
