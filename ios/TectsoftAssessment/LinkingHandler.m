#import "LinkingHandler.h"
#import <React/RCTLinkingManager.h>

BOOL TectsoftLinkingHandleOpenURL(
    UIApplication *app,
    NSURL *url,
    NSDictionary<UIApplicationOpenURLOptionsKey, id> *options)
{
  return [RCTLinkingManager application:app openURL:url options:options];
}
