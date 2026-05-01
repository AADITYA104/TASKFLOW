import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, SafeAreaView, StatusBar, Alert
} from 'react-native';

// Set your Railway URL here once deployed. 
// For local testing in Expo Go on physical device, use your local IP address, e.g., 'http://192.168.x.x:3000/api'
const API_URL = 'https://your-railway-app-url.up.railway.app/api'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  
  const handleLogin = async () => {
    if(!email || !password) return Alert.alert("Error", "Please fill all fields");
    
    setIsLoading(true);
    try {
      // NOTE: Replace with actual fetch call once backend URL is set
      /*
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.msg);
      
      setToken(data.token);
      setUser(data.user);
      fetchTasks(data.token);
      */
      
      // Dummy login for immediate Expo Go testing before Railway deployment
      setUser({ name: email.split('@')[0], role: email.includes('admin') ? 'admin' : 'member' });
      setToken('dummy-token');
      setTasks([
        { _id: '1', title: 'Setup Expo App', status: 'done', due: '2026-05-01' },
        { _id: '2', title: 'Deploy Backend to Railway', status: 'in-progress', due: '2026-05-02' }
      ]);
      
    } catch(err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if(res.ok) setTasks(data);
    } catch(err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.authContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>TF</Text>
          </View>
          <Text style={styles.title}>TaskFlow Mobile</Text>
          <Text style={styles.subtitle}>Sign in to your workspace</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Email (e.g., admin@taskflow.io)" 
            placeholderTextColor="#a1a1aa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            placeholderTextColor="#a1a1aa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Welcome back, {user.name} ({user.role})</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Tasks</Text>
          <Text style={styles.statValue}>{tasks.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{tasks.filter(t => t.status === 'done').length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({item}) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <View style={styles.taskMeta}>
              <Text style={styles.taskDue}>Due: {item.due || 'No date'}</Text>
              <View style={[styles.statusBadge, 
                item.status === 'done' ? {backgroundColor: '#10b98120'} : 
                item.status === 'in-progress' ? {backgroundColor: '#3b82f620'} : 
                {backgroundColor: '#64748b20'}
              ]}>
                <Text style={[styles.statusText, 
                  item.status === 'done' ? {color: '#10b981'} : 
                  item.status === 'in-progress' ? {color: '#3b82f6'} : 
                  {color: '#a1a1aa'}
                ]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{color: '#a1a1aa', textAlign: 'center'}}>No tasks found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Dark theme matching web
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#fafafa',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    color: '#fafafa',
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  btnPrimary: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  headerSub: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#27272a',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: '#fafafa',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  taskTitle: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDue: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
