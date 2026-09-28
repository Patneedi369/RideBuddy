import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/api';
import { colors, borderRadius, spacing } from '../../theme';
import { ChatMessage } from '../../types';

export const RideChatScreen = ({ route, navigation }: any) => {
  const { rideId } = route.params || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchMessages = async () => {
    try {
      const msgs = await fetchWithAuth(`/rides/${rideId}/messages`);
      setMessages(msgs);
    } catch (e: any) {
      console.log('Error fetching chat:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [rideId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    setSending(true);

    try {
      await fetchWithAuth(`/rides/${rideId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message_text: msgText }),
      });
      await fetchMessages();
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      alert(e.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Ride</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Text style={styles.chatHeader}>Ride Chat</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.ink} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <View key={msg.id} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.senderName, isMe && { color: '#ddd' }]}>
                      {msg.sender?.name || 'Participant'}
                    </Text>
                    <Text style={[styles.messageText, isMe && { color: colors.white }]}>
                      {msg.message_text}
                    </Text>
                    <Text style={[styles.timeText, isMe && { color: '#bbb' }]}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  chatHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: borderRadius.md,
    marginVertical: 4,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.ink,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: colors.ink,
  },
  timeText: {
    fontSize: 9,
    color: colors.muted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.soft,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
  },
  sendBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginLeft: 8,
  },
  sendBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
